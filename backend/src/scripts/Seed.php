<?php
/**
 * Database Seeding Script
 * Populate database with initial admin user and sample data
 */
class DatabaseSeeder {
    public static function run() {
        try {
            echo "🌱 Seeding database...\n\n";

            self::seedUsers();
            self::seedPrograms();
            self::seedStories();
            self::seedTeamMembers();
            self::seedPartners();

            echo "\n✅ Database seeding completed!\n";
            return true;
        } catch (Exception $e) {
            error_log('Seeding error: ' . $e->getMessage());
            echo "❌ Seeding failed: " . $e->getMessage() . "\n";
            return false;
        }
    }

    private static function seedUsers() {
        echo "👤 Seeding users...\n";
        
        $adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@silvershield.org';
        $adminPassword = $_ENV['ADMIN_PASSWORD'] ?? 'Admin@12345';
        $adminPasswordHash = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);

        try {
            $existing = Database::query(
                "SELECT id FROM users WHERE email = ? LIMIT 1",
                [$adminEmail]
            );

            if (empty($existing)) {
                Database::query(
                    "INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)",
                    ['Silver Shield Admin', $adminEmail, $adminPasswordHash, 'admin']
                );
                echo "  ✓ Admin user created\n";
            } else {
                echo "  ✓ Admin user already exists\n";
            }
        } catch (Exception $e) {
            echo "  ✗ Error: " . $e->getMessage() . "\n";
        }
    }

    private static function seedPrograms() {
        echo "📚 Seeding programs...\n";

        try {
            $count = Database::query("SELECT COUNT(*) as cnt FROM programs");
            if (!empty($count) && $count[0]['cnt'] > 0) {
                echo "  ✓ Programs already exist\n";
                return;
            }

            $programs = [
                [
                    'title' => 'Girls STEM Fellowship',
                    'slug' => 'girls-stem-fellowship',
                    'summary' => 'Mentorship, digital labs, and scholarships for girls in underserved schools.',
                    'description' => 'Silver Shield runs a 12-month STEM fellowship with laptop grants, coding clubs, and leadership coaching.',
                    'category' => 'Education',
                    'location' => 'kandui, Kenya'
                ],
                [
                    'title' => 'Community Health Outreach',
                    'slug' => 'community-health-outreach',
                    'summary' => 'Mobile clinics, preventive screenings, and referral pathways for rural families.',
                    'description' => 'Deploys volunteer clinicians and health workers to deliver primary care and health talks.',
                    'category' => 'Health',
                    'location' => 'Kisumu County, Kenya'
                ],
                [
                    'title' => 'Youth Climate Labs',
                    'slug' => 'youth-climate-labs',
                    'summary' => 'Youth-led climate adaptation pilots focused on clean water and regenerative farming.',
                    'description' => 'Our climate labs fund prototypes and train local youth to build resilient community systems.',
                    'category' => 'Climate',
                    'location' => 'Makueni County, Kenya'
                ]
            ];

            foreach ($programs as $prog) {
                Database::query(
                    "INSERT INTO programs (title, slug, summary, description, category, location, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'active')",
                    [
                        $prog['title'],
                        $prog['slug'],
                        $prog['summary'],
                        $prog['description'],
                        $prog['category'],
                        $prog['location']
                    ]
                );
            }

            echo "  ✓ " . count($programs) . " programs created\n";
        } catch (Exception $e) {
            echo "  ✗ Error: " . $e->getMessage() . "\n";
        }
    }

    private static function seedStories() {
        echo "📖 Seeding stories...\n";

        try {
            $count = Database::query("SELECT COUNT(*) as cnt FROM stories");
            if (!empty($count) && $count[0]['cnt'] > 0) {
                echo "  ✓ Stories already exist\n";
                return;
            }

            $stories = [
                [
                    'title' => 'From Dropout to Tech Leader',
                    'slug' => 'from-dropout-to-tech-leader',
                    'excerpt' => 'How one young woman overcame poverty to become a software engineer.',
                    'author' => 'Silver Shield Team'
                ],
                [
                    'title' => 'Community Transforms Through Mentorship',
                    'slug' => 'community-transforms-mentorship',
                    'excerpt' => 'A rural community\'s journey to economic empowerment.',
                    'author' => 'Silver Shield Team'
                ]
            ];

            foreach ($stories as $story) {
                Database::query(
                    "INSERT INTO stories (title, slug, excerpt, author, status) 
                     VALUES (?, ?, ?, ?, 'published')",
                    [
                        $story['title'],
                        $story['slug'],
                        $story['excerpt'],
                        $story['author']
                    ]
                );
            }

            echo "  ✓ " . count($stories) . " stories created\n";
        } catch (Exception $e) {
            echo "  ✗ Error: " . $e->getMessage() . "\n";
        }
    }

    private static function seedTeamMembers() {
        echo "👥 Seeding team members...\n";

        try {
            $count = Database::query("SELECT COUNT(*) as cnt FROM team_members");
            if (!empty($count) && $count[0]['cnt'] > 0) {
                echo "  ✓ Team members already exist\n";
                return;
            }

            $members = [
                [
                    'name' => 'Jane Kipchoge',
                    'position' => 'Executive Director',
                    'bio' => 'Visionary leader with 15 years of NGO experience.'
                ],
                [
                    'name' => 'James Omondi',
                    'position' => 'Programs Lead',
                    'bio' => 'Expert in community engagement and program design.'
                ]
            ];

            foreach ($members as $member) {
                Database::query(
                    "INSERT INTO team_members (name, position, bio, status) 
                     VALUES (?, ?, ?, 'active')",
                    [
                        $member['name'],
                        $member['position'],
                        $member['bio']
                    ]
                );
            }

            echo "  ✓ " . count($members) . " team members created\n";
        } catch (Exception $e) {
            echo "  ✗ Error: " . $e->getMessage() . "\n";
        }
    }

    private static function seedPartners() {
        echo "🤝 Seeding partners...\n";

        try {
            $count = Database::query("SELECT COUNT(*) as cnt FROM partners");
            if (!empty($count) && $count[0]['cnt'] > 0) {
                echo "  ✓ Partners already exist\n";
                return;
            }

            echo "  ✓ No default partners added (add via API)\n";
        } catch (Exception $e) {
            echo "  ✗ Error: " . $e->getMessage() . "\n";
        }
    }
}

// Run seeder if called directly
if (php_sapi_name() === 'cli') {
    require_once __DIR__ . '/../config/Env.php';
    require_once __DIR__ . '/../config/Database.php';
    Env::load();
    DatabaseSeeder::run();
}
