<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function register(Request $request)
{
    $request->validate([
        'username' => 'required|string|max:50|unique:users',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:6',
        'first_name' => 'nullable|string|max:100',
        'last_name' => 'nullable|string|max:100',
        'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        'chess_rating' => 'nullable|integer',
        'bio' => 'nullable|string',
        'phone' => 'nullable|string|max:20',
        'date_of_birth' => 'nullable|date',
        'address' => 'nullable|string',
        'city' => 'nullable|string|max:100',

    ]);

    $memberRole = Role::where('name', 'member')->first();

    if (!$memberRole) {
        return response()->json(['message' => 'Member role not found'], 500);
    }

    $userData = [
      'role_id' => $memberRole->id,
        'username' => $request->username,
        'email' => $request->email,
        'password' => hash::make($request->password),
        'first_name' => $request->first_name,
        'last_name' => $request->last_name,
        'chess_rating' => $request->chess_rating,
        'bio' => $request->bio,
        'phone' => $request->phone,
        'date_of_birth' => $request->date_of_birth,
        'address' => $request->address,
        'city' => $request->city,
        'is_active' => true,
    ];


    if ($request->hasFile('profile_picture')) {
        $image = $request->file('profile_picture');
        $imageName = time().'.'.$image->extension();
        
        $path = $image->storeAs('profile_pictures', $imageName, 'public');
        
        $userData['profile_picture'] = $path;
    }

    $user = User::create($userData);

    $token = JWTAuth::fromUser($user);

    return response()->json([
        'message' => 'User registered successfully',
        'token' => $token,
        'user' => $user,
    ]);
}





public function login(Request $request) 
    {
        $credentials = $request->only('email', 'password');
        
        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }


            $user = JWTAuth::user();
            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
    'role' => $user->role->name, 
    'username' => $user->username,
    'email' => $user->email,
    'first_name' => $user->first_name,
    'last_name' => $user->last_name,
    'profile_picture' => $user->profile_picture,
    'chess_rating' => $user->chess_rating,
    'bio' => $user->bio,
    'phone' => $user->phone,
    'date_of_birth' => $user->date_of_birth,
    'address' => $user->address,
    'is_active' => $user->is_active,
    'city' =>$user->city,
                ]
            ]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }
        
        // return $this->respondWithToken($token);
    }
    
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Successfully logged out']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout'], 500);
        }
    }
    public function changePassword(Request $request)
    {
        try {
          
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthenticated. Please login again.'
                ], 401);
            }

           
            $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6|confirmed',
            ]);

            
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'errors' => [
                        'current_password' => ['The provided password does not match our records']
                    ]
                ], 422);
            }

          
            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

          
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'message' => 'Password changed successfully. Please login again.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Password change failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
