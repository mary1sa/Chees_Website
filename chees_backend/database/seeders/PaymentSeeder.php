<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all active courses
        $courses = Course::where('is_active', true)->get();
        
        // Get users with member role
        $members = User::whereHas('role', function($query) {
            $query->where('name', 'member');
        })->get();
        
        // If no members, create some for testing
        if ($members->isEmpty()) {
            // Get member role ID
            $memberRole = \App\Models\Role::where('name', 'member')->first();
            if ($memberRole) {
                $members = [];
                for ($i = 0; $i < 15; $i++) {
                    $member = User::factory()->create([
                        'role_id' => $memberRole->id
                    ]);
                    $members[] = $member;
                }
            }
        }
        
        // Payment statuses with weight for random selection
        $statuses = [
            'completed' => 75,  // 75% chance
            'pending' => 15,    // 15% chance
            'failed' => 10,     // 10% chance
        ];
        
        // Payment methods
        $paymentMethods = [
            'credit_card' => 60,  // 60% chance
            'paypal' => 25,       // 25% chance
            'bank_transfer' => 10, // 10% chance
            'stripe' => 5,        // 5% chance
        ];
        
        // Generate purchase dates (mostly in past 6 months, some older)
        $now = Carbon::now();
        
        // For each member, create 2-3 course purchases
        foreach ($members as $member) {
            // Each member purchases only 2-3 courses
            $coursesToPurchase = rand(2, 3);
            
            // Randomly select courses for this member
            $memberCourses = $courses->random(min($coursesToPurchase, $courses->count()));
            
            foreach ($memberCourses as $course) {
                // Randomly determine when this purchase happened (weighted toward recent)
                $daysAgo = $this->getRandomDaysAgo();
                $purchaseDate = $now->copy()->subDays($daysAgo);
                
                // Randomly select payment status (weighted)
                $status = $this->getWeightedRandom($statuses);
                
                // Randomly select payment method (weighted)
                $paymentMethod = $this->getWeightedRandom($paymentMethods);
                
                // Generate a realistic transaction ID
                $transactionId = $this->generateTransactionId($paymentMethod);
                
                // Create the payment record
                Payment::firstOrCreate(
                    [
                        'user_id' => $member->id,
                        'related_id' => $course->id,
                        'related_type' => Course::class,
                        'status' => 'completed', // Only check completed payments for uniqueness
                    ],
                    [
                        'amount' => $course->price,
                        'payment_method' => $paymentMethod,
                        'transaction_id' => $transactionId,
                        'status' => $status,
                        'description' => "Payment for course: {$course->title}",
                        'payment_date' => $purchaseDate,
                    ]
                );
                
                // If the customer attempted another payment for a failed one
                if ($status === 'failed' && rand(1, 100) <= 70) { // 70% of failed payments are retried
                    // Create a successful retry payment 1-3 days later
                    $retryDate = $purchaseDate->copy()->addDays(rand(1, 3));
                    
                    Payment::create([
                        'user_id' => $member->id,
                        'amount' => $course->price,
                        'payment_method' => $this->getWeightedRandom($paymentMethods), // May try a different method
                        'transaction_id' => $this->generateTransactionId($paymentMethod),
                        'status' => 'completed',
                        'description' => "Payment for course: {$course->title} (retry)",
                        'payment_date' => $retryDate,
                        'related_id' => $course->id,
                        'related_type' => Course::class,
                    ]);
                }
            }
        }
    }
    
    /**
     * Get a weighted random value from an array where keys are values and values are weights
     */
    private function getWeightedRandom(array $weightedValues): string
    {
        $rand = mt_rand(1, 100);
        $total = 0;
        
        foreach ($weightedValues as $value => $weight) {
            $total += $weight;
            if ($rand <= $total) {
                return $value;
            }
        }
        
        // Fallback to first key
        return array_key_first($weightedValues);
    }
    
    /**
     * Generate random days ago with more recent dates having higher probability
     */
    private function getRandomDaysAgo(): int
    {
        $rand = mt_rand(1, 100);
        
        // 60% chance of within last 30 days
        if ($rand <= 60) {
            return mt_rand(1, 30);
        }
        
        // 30% chance of within last 31-120 days
        if ($rand <= 90) {
            return mt_rand(31, 120);
        }
        
        // 10% chance of within last 121-365 days
        return mt_rand(121, 365);
    }
    
    /**
     * Generate a realistic transaction ID based on payment method
     */
    private function generateTransactionId(string $paymentMethod): string
    {
        $prefix = '';
        
        switch ($paymentMethod) {
            case 'credit_card':
                $prefix = 'CC';
                break;
            case 'paypal':
                $prefix = 'PP';
                break;
            case 'bank_transfer':
                $prefix = 'BT';
                break;
            case 'stripe':
                $prefix = 'CH'; // Charge
                break;
            default:
                $prefix = 'TX';
        }
        
        // Generate random alphanumeric string
        $randomString = Str::upper(Str::random(12));
        
        // Format: PREFIX-RANDOM-TIMESTAMP
        return $prefix . '-' . $randomString . '-' . time();
    }
}
