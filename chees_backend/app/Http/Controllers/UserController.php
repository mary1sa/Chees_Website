<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function getAllUsers()
    {
        $users = User::with('role')
            ->whereIn('role_id', [2, 3])
            ->get();

        return response()->json($users);
    }
    
    public function getAllUsersWithoutRoleFilter()
    {
        $users = User::with('role')->get();
        return response()->json($users);
    }
    
    public function getUserCount()
    {
        $count = User::count();
        return response()->json(['count' => $count]);
    }

    public function getCoaches()
    {
        $users = User::with('role')
        ->whereHas('role', function ($query) {
            $query->where('name', 'coach'); 
        })
        ->get();

    return response()->json($users);
    }




    
    public function getUserById($id)
    {
        $user = User::with('role')->find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50|unique:users',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role_id' => 'exists:roles,id',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'chess_rating' => 'nullable|integer',
            'bio' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = $validator->validated();

        if ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $imageName = time().'.'.$image->extension();
            $path = $image->storeAs('profile_pictures', $imageName, 'public');
            $userData['profile_picture'] = $path;
        }

        $userData['password'] = Hash::make($userData['password']);

        $user = User::create($userData);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'username' => ['string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'email' => ['email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role_id' => 'exists:roles,id',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'chess_rating' => 'nullable|integer',
            'bio' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = $validator->validated();

        if (!empty($userData['password'])) {
            $userData['password'] = Hash::make($userData['password']);
        } else {
            unset($userData['password']);
        }

        if ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $imageName = time().'.'.$image->extension();
            $path = $image->storeAs('profile_pictures', $imageName, 'public');
            $userData['profile_picture'] = $path;
        }

        $user->update($userData);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
    
}
