<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EventRegistration;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class EventRegistrationsTableSeeder extends Seeder
{
    public function run()
    {
        $registrations = [
            [
                'event_id' => 1,
                'user_id' => 1,
                'registration_number' => 'EVT-2023-001',
                'status' => 'confirmed',
                'payment_status' => 'completed',
                'transaction_id' => 'PAY-123456',
                'paid_amount' => 50.00,
                'notes' => 'Early bird registration',
            ],
            [
                'event_id' => 1,
                'user_id' => 2,
                'registration_number' => 'EVT-2023-002',
                'status' => 'confirmed',
                'payment_status' => 'completed',
                'transaction_id' => 'PAY-123457',
                'paid_amount' => 50.00,
                'notes' => 'FIDE rated player',
            ],
            [
                'event_id' => 1,
                'user_id' => 3,
                'registration_number' => 'EVT-2023-003',
                'status' => 'pending',
                'payment_status' => 'pending',
                'paid_amount' => null,
            ],
            [
                'event_id' => 2,
                'user_id' => 4,
                'registration_number' => 'EVT-2023-004',
                'status' => 'confirmed',
                'payment_status' => 'completed',
                'transaction_id' => 'PAY-123458',
                'paid_amount' => 25.00,
            ],
            [
                'event_id' => 2,
                'user_id' => 5,
                'registration_number' => 'EVT-2023-005',
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'transaction_id' => 'PAY-123459',
                'paid_amount' => 25.00,
                'notes' => 'Cancelled due to schedule conflict',
            ],
            [
                'event_id' => 3,
                'user_id' => 6,
                'registration_number' => 'EVT-2023-006',
                'status' => 'confirmed',
                'payment_status' => 'completed',
                'transaction_id' => 'PAY-123460',
                'paid_amount' => 10.00,
            ],
            [
                'event_id' => 4,
                'user_id' => 7,
                'registration_number' => 'EVT-2023-007',
                'status' => 'confirmed',
                'payment_status' => 'completed',
                'transaction_id' => 'PAY-123461',
                'paid_amount' => 20.00,
                'notes' => 'First Chess960 tournament',
            ],
            [
                'event_id' => 5,
                'user_id' => 8,
                'registration_number' => 'EVT-2023-008',
                'status' => 'attended',
                'payment_status' => 'completed',
                'transaction_id' => 'PAY-123462',
                'paid_amount' => 100.00,
            ],
        ];

        foreach ($registrations as $registration) {
            EventRegistration::create($registration);
        }
    }
}
