<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

use function Laravel\Prompts\password;

// Membuat / mereset akun super-admin di server: php artisan saas:superadmin admin@cloudbizz.my.id
#[Signature('saas:superadmin {email} {--name=Super Admin}')]
#[Description('Buat atau reset password akun super-admin platform')]
class CreateSuperadmin extends Command
{
    public function handle(): int
    {
        $email = strtolower($this->argument('email'));
        $existing = User::where('email', $email)->first();

        if ($existing && ! $existing->isSuperadmin()) {
            $this->error("Email {$email} sudah dipakai akun tenant.");

            return self::FAILURE;
        }

        $secret = password(label: 'Password (min. 8 karakter)', required: true, validate: fn (string $v) => strlen($v) < 8 ? 'Minimal 8 karakter.' : null);

        User::updateOrCreate(['email' => $email], [
            'name' => $existing?->name ?? $this->option('name'),
            'role' => 'superadmin',
            'tenant_id' => null,
            'password' => $secret,
        ]);

        $this->info(($existing ? 'Password super-admin diperbarui: ' : 'Super-admin dibuat: ').$email);

        return self::SUCCESS;
    }
}
