<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class TwentyEightHoursAfterSignUp extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($user)
    {
        $this->user = $user;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $user = $this->user->name;
        $delivery_time = $this->user->created_at->addHours(28);
        return $this->view('emails.user.twentyeight_hours_after_signup', [ 'user' => $user ])
            ->from('info@uniclixapp.com')
            ->subject('Schedule your UniClix free demo - no strings attached')
            ->withSwiftMessage(function ($message) use ($delivery_time) {
                $message->getHeaders()->addTextHeader('X-Mailgun-Deliver-By', $delivery_time->toRfc2822String());
            });;
    }
}
