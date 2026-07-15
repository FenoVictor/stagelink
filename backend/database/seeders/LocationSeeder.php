<?php

namespace Database\Seeders;

use App\Models\Commune;
use App\Models\Country;
use App\Models\District;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $country = Country::create(['name' => 'Madagascar', 'iso_code' => 'MG']);

        $provinces = [
            'Toliara' => [
                'regions' => [
                    'Atsimo Andrefana' => [
                        'districts' => [
                            'Toliara I' => [
                                'communes' => ['Toliara', 'Ankatsaka', 'Mangily', 'Betioky Sud'],
                            ],
                            'Toliara II' => [
                                'communes' => ['Ankililoaka', 'Bemanonga', 'Marofoty', 'Miary'],
                            ],
                            'Benenitra' => [
                                'communes' => ['Benenitra', 'Ianapera', 'Miary', 'Soavina'],
                            ],
                            'Beroroha' => [
                                'communes' => ['Beroroha', 'Anosy', 'Bekatra', 'Marerano'],
                            ],
                            'Betioky Atsimo' => [
                                'communes' => ['Betioky', 'Andranovory', 'Antohabato', 'Salobe'],
                            ],
                            'Morombe' => [
                                'communes' => ['Morombe', 'Ambahiky', 'Antanimeva', 'Nosy Ambositra'],
                            ],
                            'Sakaraha' => [
                                'communes' => ['Sakaraha', 'Ambinany', 'Bekily', 'Tanambao'],
                            ],
                        ],
                    ],
                ],
            ],
            'Antananarivo' => [
                'regions' => [
                    'Analamanga' => [
                        'districts' => [
                            'Antananarivo Renivohitra' => [
                                'communes' => ['Antananarivo', 'Ankadinandriana', 'Isotry', 'Mahamasina'],
                            ],
                            'Antananarivo Atsimondrano' => [
                                'communes' => ['Ambohidratrimo', 'Anosibe', 'Ankadikely'],
                            ],
                            'Antananarivo Avaradrano' => [
                                'communes' => ['Ambohimanga', 'Andranonahoatra', 'Sabotsy Namehana'],
                            ],
                        ],
                    ],
                ],
            ],
            'Fianarantsoa' => [
                'regions' => [
                    'Haute Matsiatra' => [
                        'districts' => [
                            'Fianarantsoa I' => [
                                'communes' => ['Fianarantsoa', 'Ankarana', 'Andrainjato'],
                            ],
                            'Lalangina' => [
                                'communes' => ['Ambalakely', 'Faliarivo', 'Iavomanitra'],
                            ],
                        ],
                    ],
                ],
            ],
            'Antsiranana' => [
                'regions' => [
                    'Diana' => [
                        'districts' => [
                            'Antsiranana I' => [
                                'communes' => ['Antsiranana', 'Antanamitarana', 'Mahatsara'],
                            ],
                            'Antsiranana II' => [
                                'communes' => ['Andranokoditra', 'Bobasakoa', 'Mitsinjo'],
                            ],
                        ],
                    ],
                ],
            ],
            'Mahajanga' => [
                'regions' => [
                    'Boeny' => [
                        'districts' => [
                            'Mahajanga I' => [
                                'communes' => ['Mahajanga', 'Amborovy', 'Antanimalandy'],
                            ],
                        ],
                    ],
                ],
            ],
            'Toamasina' => [
                'regions' => [
                    'Atsinanana' => [
                        'districts' => [
                            'Toamasina I' => [
                                'communes' => ['Toamasina', 'Ambodimanga', 'Ankirihiry'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($provinces as $provinceName => $provinceData) {
            $province = Province::create(['country_id' => $country->id, 'name' => $provinceName]);

            foreach ($provinceData['regions'] as $regionName => $regionData) {
                $region = Region::create(['province_id' => $province->id, 'name' => $regionName]);

                foreach ($regionData['districts'] as $districtName => $districtData) {
                    $district = District::create(['region_id' => $region->id, 'name' => $districtName]);

                    foreach ($districtData['communes'] as $communeName) {
                        Commune::create(['district_id' => $district->id, 'name' => $communeName]);
                    }
                }
            }
        }
    }
}
