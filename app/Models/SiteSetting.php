<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa las configuraciones globales del sitio.
 */
class SiteSetting extends Model
{
    /**
     * Indica que la tabla no tiene columna auto-increment.
     * 
     * @var bool
     */
    
    public $incrementing = false;

    /**
     * Clave primaria nula ya que la tabla funciona como un almacenamiento de pares clave-valor.
     *
     * @var null
     */
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