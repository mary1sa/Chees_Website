<?php



namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        $users = [
            [
                'role_id' => 1,
                'username' => 'admin',
                'email' => 'admin@chessclub.com',
                'password' => Hash::make('Admin@123'),
                'first_name' => 'Admin',
                'last_name' => 'System',
                'profile_picture' => null,
                'chess_rating' => 1800,
                'bio' => 'System administrator',
                'phone' => '+1000000001',
                'date_of_birth' => '1980-01-01',
                'address' => '123 Admin Street',
                'city' => 'Metropolis',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'role_id' => 2,
                'username' => 'coach1',
                'email' => 'coach1@chessclub.com',
                'password' => Hash::make('Coach1@123'),
                'first_name' => 'Alex',
                'last_name' => 'Petrov',
                'profile_picture' => null,
                'chess_rating' => 2200,
                'bio' => 'Professional chess coach with 10 years experience',
                'phone' => '+1000000002',
                'date_of_birth' => '1985-05-15',
                'address' => '456 Chess Avenue',
                'city' => 'Chessville',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 2,
                'username' => 'coach2',
                'email' => 'coach2@chessclub.com',
                'password' => Hash::make('Coach2@123'),
                'first_name' => 'Maria',
                'last_name' => 'Ivanova',
                'profile_picture' => null,
                'chess_rating' => 2100,
                'bio' => 'Women\'s chess champion and coach',
                'phone' => '+1000000003',
                'date_of_birth' => '1990-08-20',
                'address' => '789 Grandmaster Lane',
                'city' => 'Chessington',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'role_id' => 3,
                'username' => 'member1',
                'email' => 'member1@chessclub.com',
                'password' => Hash::make('Member1@123'),
                'first_name' => 'John',
                'last_name' => 'Smith',
                'profile_picture' => null,
                'chess_rating' => 1200,
                'bio' => 'Beginner chess enthusiast',
                'phone' => '+1000000004',
                'date_of_birth' => '1995-03-10',
                'address' => '101 Pawn Street',
                'city' => 'Chessboro',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 3,
                'username' => 'member2',
                'email' => 'member2@chessclub.com',
                'password' => Hash::make('Member2@123'),
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'profile_picture' => null,
                'chess_rating' => 1500,
                'bio' => 'Intermediate player looking to improve',
                'phone' => '+1000000005',
                'date_of_birth' => '1992-07-22',
                'address' => '202 Bishop Road',
                'city' => 'Kingsville',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 3,
                'username' => 'member3',
                'email' => 'member3@chessclub.com',
                'password' => Hash::make('Member3@123'),
                'first_name' => 'David',
                'last_name' => 'Wilson',
                'profile_picture' => null,
                'chess_rating' => 1700,
                'bio' => 'Advanced player competing in tournaments',
                'phone' => '+1000000006',
                'date_of_birth' => '1988-11-15',
                'address' => '303 Knight Court',
                'city' => 'Queensburg',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 3,
                'username' => 'member4',
                'email' => 'member4@chessclub.com',
                'password' => Hash::make('Member4@123'),
                'first_name' => 'Emma',
                'last_name' => 'Brown',
                'profile_picture' => null,
                'chess_rating' => 1400,
                'bio' => 'Casual player enjoying the game',
                'phone' => '+1000000007',
                'date_of_birth' => '1993-09-05',
                'address' => '404 Rook Avenue',
                'city' => 'Castleton',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
                DB::table('users')->insert($users);
    }
}
