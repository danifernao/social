<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    /**
     * Indica que la tabla no tiene columna auto-increment ni clave primaria.
     */
    public $incrementing = false;
    protected $primaryKey = null;

    /**
     * Define los atributos con casting automático.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_user_registration_enabled' => 'boolean',
        ];
    }
}