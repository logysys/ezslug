<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorAnalytic extends Model
{
    // If you named your table differently, define it here:
    // protected $table = 'visitor_analytics';

    protected $fillable = [
        'user_id',
        'funnel_id',
        'ip_address',
        'method',
        'url',
        'referer',
        'user_agent',
        'location_data',
    ];

    protected $casts = [
        'location_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function funnel()
    {
        return $this->belongsTo(EzFunnel::class, 'funnel_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
	
}