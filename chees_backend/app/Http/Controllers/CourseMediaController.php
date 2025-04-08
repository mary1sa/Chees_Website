<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class CourseMediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $directory = $request->query('directory', 'media');
        $type = $request->query('type');
        
        $files = Storage::disk('public')->files($directory);
        $directories = Storage::disk('public')->directories($directory);
        
        $mediaFiles = [];
        
        foreach ($files as $file) {
            $extension = pathinfo($file, PATHINFO_EXTENSION);
            $fileType = $this->getFileType($extension);
            
            // Filter by type if specified
            if ($type && $fileType !== $type) {
                continue;
            }
            
            $mediaFiles[] = [
                'name' => basename($file),
                'path' => $file,
                'url' => asset('storage/' . $file),
                'size' => Storage::disk('public')->size($file),
                'type' => $fileType,
                'last_modified' => Storage::disk('public')->lastModified($file),
            ];
        }
        
        $mediaDirectories = [];
        
        foreach ($directories as $dir) {
            $mediaDirectories[] = [
                'name' => basename($dir),
                'path' => $dir,
                'files_count' => count(Storage::disk('public')->files($dir)),
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'files' => $mediaFiles,
                'directories' => $mediaDirectories,
                'current_directory' => $directory
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json([
            'message' => 'Method not supported for API'
        ], 405);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'file' => 'required|file|max:51200', // 50MB max
        'directory' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $file = $request->file('file');
    $directory = $request->input('directory', 'media');
    
    // Create directory if it doesn't exist
    if (!Storage::disk('public')->exists($directory)) {
        Storage::disk('public')->makeDirectory($directory);
    }
    
    // Get file details
    $originalName = $file->getClientOriginalName();
    $extension = $file->getClientOriginalExtension();
    $fileType = $this->getFileType($extension);
    
    // Generate a unique filename
    $filename = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
    
    // Store the file
    $path = Storage::disk('public')->putFileAs($directory, $file, $filename);
    
    return response()->json([
        'success' => true,
        'message' => 'File uploaded successfully',
        'data' => [
            'name' => $filename,
            'original_name' => $originalName,
            'path' => $path,
            'url' => asset('storage/' . $path),
            'size' => Storage::disk('public')->size($path),
            'type' => $fileType,
        ]
    ], 201);
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
{
    $path = base64_decode($id);
    
    if (!Storage::disk('public')->exists($path)) {
        return response()->json([
            'success' => false,
            'message' => 'File not found'
        ], 404);
    }
    
    try {
        // Use mime_content_type function instead, which is more widely available
        $mimeType = mime_content_type(Storage::disk('public')->path($path));
    } catch (\Exception $e) {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $mimeType = $this->getMimeTypeFromExtension($extension);
    }
    
    $file = [
        'name' => basename($path),
        'path' => $path,
        'url' => asset('storage/' . $path),
        'size' => Storage::disk('public')->size($path),
        'type' => $this->getFileType(pathinfo($path, PATHINFO_EXTENSION)),
        'last_modified' => Storage::disk('public')->lastModified($path),
        'mime_type' => $mimeType,
    ];
    
    return response()->json([
        'success' => true,
        'data' => $file
    ]);
}

// Add this helper method at the end of the class
    /**
     * Get MIME type from file extension
     */
    private function getMimeTypeFromExtension(string $extension): string
    {
        $extension = strtolower($extension);
        
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt' => 'text/plain',
            'mp4' => 'video/mp4',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'ogg' => 'audio/ogg',
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
        ];
        
        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        return response()->json([
            'message' => 'Method not supported for API'
        ], 405);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $path = base64_decode($id);
        
        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'new_name' => 'nullable|string|max:255',
            'new_directory' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $currentDirectory = dirname($path);
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        
        // Handle renaming
        if ($request->has('new_name')) {
            $newName = Str::slug($request->new_name) . '.' . $extension;
            $newPath = $currentDirectory . '/' . $newName;
            
            // Check if destination already exists
            if (Storage::disk('public')->exists($newPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A file with this name already exists'
                ], 422);
            }
            
            Storage::disk('public')->move($path, $newPath);
            $path = $newPath;
        }
        
        // Handle moving to new directory
        if ($request->has('new_directory')) {
            $newDirectory = $request->new_directory;
            
            // Create directory if it doesn't exist
            if (!Storage::disk('public')->exists($newDirectory)) {
                Storage::disk('public')->makeDirectory($newDirectory);
            }
            
            $fileName = basename($path);
            $newPath = $newDirectory . '/' . $fileName;
            
            // Check if destination already exists
            if (Storage::disk('public')->exists($newPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'A file with this name already exists in the destination directory'
                ], 422);
            }
            
            Storage::disk('public')->move($path, $newPath);
            $path = $newPath;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'File updated successfully',
            'data' => [
                'name' => basename($path),
                'path' => $path,
                'url' => asset('storage/' . $path),
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $path = base64_decode($id);
        
        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
        
        Storage::disk('public')->delete($path);
        
        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    }
    
    /**
     * Create a new directory
     */
    public function createDirectory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'parent_directory' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $name = Str::slug($request->name);
        $parentDirectory = $request->input('parent_directory', 'media');
        $path = $parentDirectory . '/' . $name;
        
        // Check if directory already exists
        if (Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Directory already exists'
            ], 422);
        }
        
        Storage::disk('public')->makeDirectory($path);
        
        return response()->json([
            'success' => true,
            'message' => 'Directory created successfully',
            'data' => [
                'name' => $name,
                'path' => $path,
            ]
        ], 201);
    }
    
    /**
     * Delete a directory and all its contents
     */
    public function deleteDirectory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'directory' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $directory = $request->directory;
        
        // Prevent deleting root media directory
        if ($directory === 'media') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete root media directory'
            ], 422);
        }
        
        // Check if directory exists
        if (!Storage::disk('public')->exists($directory)) {
            return response()->json([
                'success' => false,
                'message' => 'Directory not found'
            ], 404);
        }
        
        Storage::disk('public')->deleteDirectory($directory);
        
        return response()->json([
            'success' => true,
            'message' => 'Directory deleted successfully'
        ]);
    }
    
    /**
     * Helper method to determine file type from extension
     */
    private function getFileType(string $extension): string
    {
        $extension = strtolower($extension);
        
        $imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        $documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
        $videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
        $audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
        $archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
        
        if (in_array($extension, $imageTypes)) {
            return 'image';
        } elseif (in_array($extension, $documentTypes)) {
            return 'document';
        } elseif (in_array($extension, $videoTypes)) {
            return 'video';
        } elseif (in_array($extension, $audioTypes)) {
            return 'audio';
        } elseif (in_array($extension, $archiveTypes)) {
            return 'archive';
        } else {
            return 'other';
        }
    }
}
