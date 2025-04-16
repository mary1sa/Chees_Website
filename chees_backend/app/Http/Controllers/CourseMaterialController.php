<?php

namespace App\Http\Controllers;

use App\Models\CourseMaterial;
use App\Models\Course;
use App\Models\CourseSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CourseMaterialController extends Controller
{
    /**
     * Display a listing of course materials.
     */
    public function index(Request $request)
    {
        $query = CourseMaterial::query();
          
        // Filter by course if provided
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        
        // Filter by session if provided
        if ($request->has('session_id')) {
            $query->where('session_id', $request->session_id);
        }
        
        // Filter by file type if provided
        if ($request->has('file_type')) {
            $query->where('file_type', $request->file_type);
        }
        
        $materials = $query->orderBy('created_at', 'desc')->paginate(20);
        
        // Add full URLs to results
        $materials->getCollection()->transform(function ($material) {
            if ($material->file_path) {
                $material->file_url = Storage::url($material->file_path);
            }
            return $material;
        });
        
        return response()->json([
            'success' => true,
            'data' => $materials
        ]);
    }

    /**
     * Store a newly created course material in storage.
     */
    public function store(Request $request)
    {
        // Debug what's in the request
        $debug = [
            'has_file' => $request->hasFile('file'),
            'has_file_path' => $request->hasFile('file_path'),
            'all_files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method()
        ];
        
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'session_id' => 'nullable|exists:course_sessions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:51200', // Accept file under "file" field
            'file_path' => 'nullable|file|max:51200', // Also accept file under "file_path" field
            'is_downloadable' => 'boolean',
            'order_number' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'debug' => $debug
            ], 422);
        }

        try {
            // Prepare basic data
            $materialData = [
                'course_id' => $request->course_id,
                'session_id' => $request->session_id,
                'title' => $request->title,
                'description' => $request->description,
                'is_downloadable' => $request->boolean('is_downloadable', true),
                'order_number' => $request->order_number ?? 0,
            ];
            
            // Handle file upload - check both "file" and "file_path" field names
            $fileField = null;
            if ($request->hasFile('file') && $request->file('file')->isValid()) {
                $fileField = 'file';
            } elseif ($request->hasFile('file_path') && $request->file('file_path')->isValid()) {
                $fileField = 'file_path';
            }
            
            if ($fileField) {
                $file = $request->file($fileField);
                $courseId = $request->course_id;
                
                // Get file details
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileType = $this->getFileType($extension);
                $fileSize = $file->getSize();
                
                // Generate a unique filename with slug to remove special characters
                $filename = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
                
                // Create directory if it doesn't exist
                $directory = 'course_materials/' . $courseId;
                if (!Storage::disk('public')->exists($directory)) {
                    Storage::disk('public')->makeDirectory($directory);
                }
                
                // Store the file
                $path = $file->storeAs($directory, $filename, 'public');
                
                // Add file info to material data
                $materialData['file_path'] = $path;
                $materialData['file_type'] = $fileType;
            }
            
            // Create the material record
            $material = CourseMaterial::create($materialData);
            
            // Add full URL to response if file exists
            if (isset($materialData['file_path'])) {
                $material->file_url = Storage::url($materialData['file_path']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Course material created successfully',
                'data' => $material,
                'debug' => $debug
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed',
                'error' => $e->getMessage(),
                'debug' => $debug
            ], 500);
        }
    }

    /**
     * Display the specified course material.
     */
    public function show(string $id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Add full URL to response
        if ($material->file_path) {
            $material->file_url = Storage::url($material->file_path);
        }
        
        return response()->json([
            'success' => true,
            'data' => $material
        ]);
    }

    /**
     * Update the specified course material in storage.
     */
    public function update(Request $request, string $id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Custom handling of PUT/PATCH requests with form-data
        if (($request->isMethod('PUT') || $request->isMethod('PATCH')) && 
            strpos($request->header('Content-Type'), 'multipart/form-data') !== false) {
            
            $putData = $request->getContent();
            
            // Get the boundary
            preg_match('/boundary=(.*)$/', $request->header('Content-Type'), $matches);
            if (isset($matches[1])) {
                $boundary = $matches[1];

                // Parse the multipart form data manually
                $parts = array_slice(explode('--' . $boundary, $putData), 1, -1);
                $data = [];

                foreach ($parts as $part) {
                    // If this is the file content
                    if (strpos($part, 'filename') !== false) {
                        preg_match('/name="([^"]+)"; filename="([^"]+)"/i', $part, $matches);
                        if (isset($matches[1]) && isset($matches[2])) {
                            $fieldName = $matches[1];

                            // Get file content
                            $fileContent = substr($part, strpos($part, "\r\n\r\n") + 4, -2);

                            // Create temporary file
                            $tmpfname = tempnam(sys_get_temp_dir(), 'put_');
                            file_put_contents($tmpfname, $fileContent);

                            // Create UploadedFile instance
                            $file = new \Illuminate\Http\UploadedFile(
                                $tmpfname,
                                $matches[2],
                                mime_content_type($tmpfname),
                                null,
                                true
                            );

                            $request->files->set($fieldName, $file);
                        }
                    }
                    // If this is regular form data
                    else {
                        preg_match('/name="([^"]+)"/i', $part, $matches);
                        if (isset($matches[1])) {
                            $fieldName = $matches[1];
                            $value = substr($part, strpos($part, "\r\n\r\n") + 4, -2);
                            $data[$fieldName] = $value;
                        }
                    }
                }

                $request->merge($data);
            }
        }
        
        // Debug what's in the request after processing
        $debug = [
            'has_file' => $request->hasFile('file'),
            'has_file_path' => $request->hasFile('file_path'),
            'all_files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'all_input' => $request->all()
        ];
        
        $rules = [
            'course_id' => 'exists:courses,id',
            'session_id' => 'nullable|exists:course_sessions,id',
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'is_downloadable' => 'boolean',
            'order_number' => 'nullable|integer|min:0',
        ];
        
        // Accept file under both possible field names
        if ($request->hasFile('file') || $request->hasFile('file_path')) {
            $rules['file'] = 'nullable|file|max:51200'; // 50MB max
            $rules['file_path'] = 'nullable|file|max:51200'; // 50MB max
        }
        
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'debug' => $debug
            ], 422);
        }

        try {
            // Update basic info
            $material->course_id = $request->course_id ?? $material->course_id;
            $material->session_id = $request->session_id ?? $material->session_id;
            $material->title = $request->title ?? $material->title;
            $material->description = $request->description ?? $material->description;
            $material->is_downloadable = $request->boolean('is_downloadable', $material->is_downloadable);
            $material->order_number = $request->order_number ?? $material->order_number;
            
            // Handle file update - check both potential field names
            $fileField = null;
            if ($request->hasFile('file') && $request->file('file')->isValid()) {
                $fileField = 'file';
            } elseif ($request->hasFile('file_path') && $request->file('file_path')->isValid()) {
                $fileField = 'file_path';
            }
            
            if ($fileField) {
                // Delete the old file if it exists
                if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
                    Storage::disk('public')->delete($material->file_path);
                }
                
                $file = $request->file($fileField);
                $courseId = $material->course_id;
                
                // Get file details
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileType = $this->getFileType($extension);
                
                // Generate a unique filename with slug to remove special characters
                $filename = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
                
                // Create directory if it doesn't exist
                $directory = 'course_materials/' . $courseId;
                if (!Storage::disk('public')->exists($directory)) {
                    Storage::disk('public')->makeDirectory($directory);
                }
                
                // Store the file
                $path = $file->storeAs($directory, $filename, 'public');
                
                // Update file info
                $material->file_path = $path;
                $material->file_type = $fileType;
            }
            
            $material->save();
            
            // Add full URL to response
            if ($material->file_path) {
                $material->file_url = Storage::url($material->file_path);
            }

            return response()->json([
                'success' => true,
                'message' => 'Course material updated successfully',
                'data' => $material,
                'debug' => $debug
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File update failed',
                'error' => $e->getMessage(),
                'debug' => $debug
            ], 500);
        }
    }

    /**
     * Update course material with file upload (via POST).
     * This method is needed because PUT/PATCH requests with form-data don't work well in Laravel.
     */
    public function updateWithFile(Request $request, string $id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Debug what's in the request
        $debug = [
            'has_file' => $request->hasFile('file'),
            'has_file_path' => $request->hasFile('file_path'),
            'all_files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method()
        ];
        
        $validator = Validator::make($request->all(), [
            'course_id' => 'nullable|exists:courses,id',
            'session_id' => 'nullable|exists:course_sessions,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:51200', // Accept file under "file" field
            'file_path' => 'nullable|file|max:51200', // Also accept file under "file_path" field
            'is_downloadable' => 'boolean',
            'order_number' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'debug' => $debug
            ], 422);
        }

        try {
            // Update basic info
            if ($request->has('course_id')) {
                $material->course_id = $request->course_id;
            }
            if ($request->has('session_id')) {
                $material->session_id = $request->session_id;
            }
            if ($request->has('title')) {
                $material->title = $request->title;
            }
            if ($request->has('description')) {
                $material->description = $request->description;
            }
            if ($request->has('is_downloadable')) {
                $material->is_downloadable = $request->boolean('is_downloadable');
            }
            if ($request->has('order_number')) {
                $material->order_number = $request->order_number;
            }
            
            // Handle file update - check both potential field names
            $fileField = null;
            if ($request->hasFile('file') && $request->file('file')->isValid()) {
                $fileField = 'file';
            } elseif ($request->hasFile('file_path') && $request->file('file_path')->isValid()) {
                $fileField = 'file_path';
            }
            
            if ($fileField) {
                // Delete the old file if it exists
                if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
                    Storage::disk('public')->delete($material->file_path);
                }
                
                $file = $request->file($fileField);
                $courseId = $material->course_id;
                
                // Get file details
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileType = $this->getFileType($extension);
                
                // Generate a unique filename with slug to remove special characters
                $filename = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
                
                // Create directory if it doesn't exist
                $directory = 'course_materials/' . $courseId;
                if (!Storage::disk('public')->exists($directory)) {
                    Storage::disk('public')->makeDirectory($directory);
                }
                
                // Store the file
                $path = $file->storeAs($directory, $filename, 'public');
                
                // Update file info
                $material->file_path = $path;
                $material->file_type = $fileType;
            }
            
            $material->save();
            
            // Add full URL to response
            if ($material->file_path) {
                $material->file_url = Storage::url($material->file_path);
            }

            return response()->json([
                'success' => true,
                'message' => 'Course material updated successfully',
                'data' => $material,
                'debug' => $debug
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File update failed',
                'error' => $e->getMessage(),
                'debug' => $debug
            ], 500);
        }
    }

    /**
     * Remove the specified course material from storage.
     */
    public function destroy(string $id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Delete the file if it exists in storage
        if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }
        
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course material deleted successfully'
        ]);
    }
    
    /**
     * Download a course material file
     */
    public function downloadFile(string $id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Check if file exists
        if (!$material->file_path || !Storage::disk('public')->exists($material->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        // Check if material is downloadable
        if (!$material->is_downloadable) {
            return response()->json([
                'success' => false,
                'message' => 'This material is not available for download'
            ], 403);
        }
        
        $filename = $material->title . '.' . pathinfo($material->file_path, PATHINFO_EXTENSION);
        return Storage::disk('public')->download($material->file_path, $filename);
    }
    
    /**
     * Get file preview (for images and documents)
     */
    public function getFilePreview(string $id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Check if file exists
        if (!$material->file_path || !Storage::disk('public')->exists($material->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        // For images, return the file directly
        if ($material->file_type === 'image') {
            return response()->file(Storage::disk('public')->path($material->file_path));
        }
        
        // For other file types, return a preview URL
        $url = Storage::url($material->file_path);
        
        return response()->json([
            'success' => true,
            'preview_url' => $url,
            'file_type' => $material->file_type
        ]);
    }
    
    /**
     * Get file type based on extension
     */
    private function getFileType($extension)
    {
        $extension = strtolower($extension);
        
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        $documentExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'odt'];
        $videoExtensions = ['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'mpeg', 'quicktime'];
        $audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
        
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        } elseif (in_array($extension, $documentExtensions)) {
            return 'document';
        } elseif (in_array($extension, $videoExtensions)) {
            return 'video';
        } elseif (in_array($extension, $audioExtensions)) {
            return 'audio';
        } else {
            return 'other';
        }
    }
    
    /**
     * Download a course material file.
     */
    public function download($id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Check if file exists
        if (!$material->file_path || !Storage::disk('public')->exists($material->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        // Get file information
        $path = $material->file_path;
        
        // Determine download filename
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $filename = Str::slug($material->title) . '.' . $extension;

        // Set the correct Content-Type based on file_type
        $headers = [];
        
        // Determine proper MIME type for the file
        if ($material->file_type === 'pdf') {
            $headers['Content-Type'] = 'application/pdf';
        } else if ($material->file_type === 'image') {
            // Use proper image mime type based on extension
            $imageTypes = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'bmp' => 'image/bmp',
                'svg' => 'image/svg+xml',
                'webp' => 'image/webp'
            ];
            $headers['Content-Type'] = $imageTypes[strtolower($extension)] ?? 'image/jpeg';
        } else if ($material->file_type === 'video') {
            // Video MIME types
            $videoTypes = [
                'mp4' => 'video/mp4',
                'webm' => 'video/webm',
                'avi' => 'video/x-msvideo',
                'mov' => 'video/quicktime'
            ];
            $headers['Content-Type'] = $videoTypes[strtolower($extension)] ?? 'video/mp4';
        } else if ($material->file_type === 'document') {
            // Document MIME types
            $docTypes = [
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls' => 'application/vnd.ms-excel',
                'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'ppt' => 'application/vnd.ms-powerpoint',
                'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ];
            $headers['Content-Type'] = $docTypes[strtolower($extension)] ?? 'application/octet-stream';
        }
        
        // Return file as download with proper headers
        return Storage::disk('public')->download($path, $filename, $headers);
    }
    
    /**
     * Stream/view a course material file.
     */
    public function stream($id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        // Check if file exists
        if (!$material->file_path || !Storage::disk('public')->exists($material->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        // Get file information
        $path = Storage::disk('public')->path($material->file_path);
        $type = $material->file_type;
        
        // Get mime type based on file extension
        $mimeType = Storage::disk('public')->mimeType($material->file_path);
        
        // For videos, use streaming response
        if ($type === 'video') {
            $stream = new \Symfony\Component\HttpFoundation\BinaryFileResponse($path);
            $stream->headers->set('Content-Type', $mimeType);
            return $stream;
        }
        
        // For other files, return response with file contents
        return response()->file($path);
    }
    
    /**
     * Get view URL for a course material.
     */
    public function getViewUrl($id)
    {
        $material = CourseMaterial::findOrFail($id);
        
        if (!$material->file_path) {
            return response()->json([
                'success' => false,
                'message' => 'No file associated with this material'
            ], 404);
        }
        
        $url = Storage::url($material->file_path);
        
        return response()->json([
            'success' => true,
            'view_url' => $url
        ]);
    }
}