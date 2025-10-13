<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $content = require database_path('seeders/data/page_content.php');

        $pages = [
            [
                'language' => 'es',
                'type' => 'about',
                'title' => 'Acerca de nosotros',
                'slug' => 'about-us',
                'content' => $content,
            ],
            [
                'language' => 'en',
                'type' => 'about',
                'title' => 'About Us',
                'slug' => 'about-us',
                'content' => $content,
            ],

            [
                'language' => 'es',
                'type' => 'terms',
                'title' => 'Términos y condiciones',
                'slug' => 'terms-and-conditions',
                'content' => $content,
            ],
            [
                'language' => 'en',
                'type' => 'terms',
                'title' => 'Terms and Conditions',
                'slug' => 'terms-and-conditions',
                'content' => $content,
            ],
                
            [
                'language' => 'es',
                'type' => 'policy',
                'title' => 'Política de privacidad',
                'slug' => 'privacy-policy',
                'content' => $content,
            ],
            [
                'language' => 'en',
                'type' => 'policy',
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => $content,
            ],
                
            [
                'language' => 'es',
                'type' => 'guidelines',
                'title' => 'Normas de la comunidad',
                'slug' => 'community-guidelines',
                'content' => $content,
            ],
            [
                'language' => 'en',
                'type' => 'guidelines',
                'title' => 'Community Guidelines',
                'slug' => 'community-guidelines',
                'content' => $content,
            ],
        ];
        
        DB::table('pages')->insert($pages);
    }
}