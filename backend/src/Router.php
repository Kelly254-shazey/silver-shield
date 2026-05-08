<?php
/**
 * Router - Main request dispatcher
 */
class Router {
    private $routes = [];

    public function __construct() {
        $this->registerRoutes();
    }

    private function registerRoutes() {
        // Auth routes
        $this->routes['POST /api/auth/login'] = [AuthRoutes::class, 'handleLogin'];
        $this->routes['GET /api/auth/me'] = [AuthRoutes::class, 'handleMe'];

        // Programs routes
        $this->routes['GET /api/programs'] = [ProgramRoutes::class, 'handleList'];
        $this->routes['POST /api/programs'] = [ProgramRoutes::class, 'handleCreate'];
        $this->routes['GET /api/programs/{id}'] = [ProgramRoutes::class, 'handleGet'];
        $this->routes['PUT /api/programs/{id}'] = [ProgramRoutes::class, 'handleUpdate'];
        $this->routes['DELETE /api/programs/{id}'] = [ProgramRoutes::class, 'handleDelete'];

        // Stories routes
        $this->routes['GET /api/stories'] = [StoryRoutes::class, 'handleList'];
        $this->routes['POST /api/stories'] = [StoryRoutes::class, 'handleCreate'];
        $this->routes['GET /api/stories/{id}'] = [StoryRoutes::class, 'handleGet'];
        $this->routes['PUT /api/stories/{id}'] = [StoryRoutes::class, 'handleUpdate'];
        $this->routes['DELETE /api/stories/{id}'] = [StoryRoutes::class, 'handleDelete'];

        // Donations routes
        $this->routes['GET /api/donations'] = [DonationRoutes::class, 'handleList'];
        $this->routes['POST /api/donations'] = [DonationRoutes::class, 'handleCreate'];
        $this->routes['POST /api/donations/initiate'] = [DonationRoutes::class, 'handleInitiate'];
        $this->routes['GET /api/donations/mpesa/details'] = [DonationRoutes::class, 'handleMpesaDetails'];
        $this->routes['POST /api/donations/mpesa/callback'] = [DonationRoutes::class, 'handleMpesaCallback'];
        $this->routes['POST /api/donations/payhero/callback'] = [DonationRoutes::class, 'handlePayheroCallback'];

        // Volunteers routes
        $this->routes['GET /api/volunteers'] = [VolunteerRoutes::class, 'handleList'];
        $this->routes['POST /api/volunteers'] = [VolunteerRoutes::class, 'handleRegister'];

        // Messages routes
        $this->routes['GET /api/messages'] = [MessageRoutes::class, 'handleList'];
        $this->routes['POST /api/messages'] = [MessageRoutes::class, 'handleCreate'];
        $this->routes['GET /api/messages/{id}'] = [MessageRoutes::class, 'handleGet'];
        $this->routes['PUT /api/messages/{id}'] = [MessageRoutes::class, 'handleUpdate'];
        $this->routes['POST /api/messages/{id}/reply'] = [MessageRoutes::class, 'handleReply'];
        $this->routes['POST /api/messages/{id}/archive'] = [MessageRoutes::class, 'handleArchive'];
        $this->routes['DELETE /api/messages/{id}'] = [MessageRoutes::class, 'handleDelete'];

        // Team routes
        $this->routes['GET /api/team'] = [TeamRoutes::class, 'handleList'];
        $this->routes['POST /api/team'] = [TeamRoutes::class, 'handleCreate'];
        $this->routes['GET /api/team/members'] = [TeamRoutes::class, 'handleMembers'];
        $this->routes['GET /api/team/members/admin'] = [TeamRoutes::class, 'handleMembersAdmin'];
        $this->routes['POST /api/team/members'] = [TeamRoutes::class, 'handleMemberCreate'];
        $this->routes['PUT /api/team/members/{id}'] = [TeamRoutes::class, 'handleMemberUpdate'];
        $this->routes['DELETE /api/team/members/{id}'] = [TeamRoutes::class, 'handleMemberDelete'];
        $this->routes['GET /api/team/board'] = [TeamRoutes::class, 'handleBoard'];
        $this->routes['GET /api/team/board/admin'] = [TeamRoutes::class, 'handleBoardAdmin'];
        $this->routes['POST /api/team/board'] = [TeamRoutes::class, 'handleBoardCreate'];
        $this->routes['PUT /api/team/board/{id}'] = [TeamRoutes::class, 'handleBoardUpdate'];
        $this->routes['DELETE /api/team/board/{id}'] = [TeamRoutes::class, 'handleBoardDelete'];

        // Events routes
        $this->routes['GET /api/events'] = [EventRoutes::class, 'handleList'];
        $this->routes['POST /api/events'] = [EventRoutes::class, 'handleCreate'];
        $this->routes['PUT /api/events/{id}'] = [EventRoutes::class, 'handleUpdate'];
        $this->routes['DELETE /api/events/{id}'] = [EventRoutes::class, 'handleDelete'];
        $this->routes['POST /api/events/register'] = [EventRoutes::class, 'handleRegister'];

        // Upload routes
        $this->routes['POST /api/upload'] = [UploadRoutes::class, 'handleUpload'];
        $this->routes['POST /api/upload/upload'] = [UploadRoutes::class, 'handleUpload'];

        // About routes
        $this->routes['GET /api/about'] = [AboutRoutes::class, 'handleGet'];
        $this->routes['PUT /api/about'] = [AboutRoutes::class, 'handleUpdate'];

        // Partners, Impact, Docs, AI routes
        $this->routes['GET /api/partners'] = [PartnerRoutes::class, 'handleList'];
        $this->routes['POST /api/partners'] = [PartnerRoutes::class, 'handleCreate'];
        $this->routes['PUT /api/partners/{id}'] = [PartnerRoutes::class, 'handleUpdate'];
        $this->routes['DELETE /api/partners/{id}'] = [PartnerRoutes::class, 'handleDelete'];
        $this->routes['GET /api/impact'] = [ImpactRoutes::class, 'handleStats'];
        $this->routes['GET /api/impact/stats'] = [ImpactRoutes::class, 'handleStats'];
        $this->routes['POST /api/impact/stats'] = [ImpactRoutes::class, 'handleCreateStat'];
        $this->routes['PUT /api/impact/stats/{id}'] = [ImpactRoutes::class, 'handleUpdateStat'];
        $this->routes['DELETE /api/impact/stats/{id}'] = [ImpactRoutes::class, 'handleDeleteStat'];
        $this->routes['GET /api/docs/public'] = [DocRoutes::class, 'handleListPublic'];
        $this->routes['GET /api/docs/public/{id}/download'] = [DocRoutes::class, 'handleDownload'];
        $this->routes['GET /api/docs'] = [DocRoutes::class, 'handleList'];
        $this->routes['POST /api/docs'] = [DocRoutes::class, 'handleCreate'];
        $this->routes['GET /api/docs/{id}'] = [DocRoutes::class, 'handleGet'];
        $this->routes['PUT /api/docs/{id}'] = [DocRoutes::class, 'handleUpdate'];
        $this->routes['DELETE /api/docs/{id}'] = [DocRoutes::class, 'handleDelete'];
        $this->routes['POST /api/docs/{id}/reindex'] = [DocRoutes::class, 'handleReindex'];
        $this->routes['POST /api/ai/query'] = [AIRoutes::class, 'handleQuery'];
        $this->routes['POST /api/ai/chat'] = [AIRoutes::class, 'handleChat'];
    }

    public function dispatch() {
        $method = Utils::getRequestMethod();
        $segments = array_filter(Utils::getPathSegments());
        $path = empty($segments) ? '/' : '/' . implode('/', $segments);
        $routePattern = "$method $path";

        // Root/API index endpoints
        if (in_array($path, ['/', '/api', '/api/index.php'], true) && $method === 'GET') {
            Utils::jsonResponse([
                'message' => 'Silver Shield API',
                'status' => 'running',
                'health' => '/api/health'
            ]);
            return;
        }

        // Health check
        if ($path === '/api/health' && $method === 'GET') {
            $this->healthCheck();
            return;
        }

        // Try exact match
        if (isset($this->routes[$routePattern])) {
            return $this->executeRoute($this->routes[$routePattern], []);
        }

        // Try parameterized routes
        foreach ($this->routes as $pattern => $handler) {
            $regex = $this->patternToRegex($pattern);
            if (preg_match($regex, $routePattern, $matches)) {
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }
                return $this->executeRoute($handler, $params);
            }
        }

        Utils::errorResponse('Not found', 404);
    }

    private function patternToRegex($pattern) {
        $regex = preg_quote($pattern, '#');
        $regex = preg_replace('#\\\{([a-zA-Z_][a-zA-Z0-9_]*)\\\}#', '(?P<$1>[^/]+)', $regex);
        return "#^$regex$#";
    }

    private function executeRoute($handler, $params) {
        try {
            [$class, $method] = $handler;
            if (empty($params)) {
                $class::$method();
            } else {
                $class::$method(...array_values($params));
            }
        } catch (Exception $e) {
            error_log('Route execution error: ' . $e->getMessage());
            Utils::errorResponse('Internal server error', 500);
        }
    }

    private function healthCheck() {
        try {
            Database::query("SELECT 1");
            Utils::jsonResponse([
                'status' => 'ok',
                'service' => 'silver-shield-api',
                'timestamp' => date('c'),
                'db' => 'connected'
            ]);
        } catch (Exception $e) {
            Utils::jsonResponse([
                'status' => 'degraded',
                'service' => 'silver-shield-api',
                'timestamp' => date('c'),
                'db' => 'disconnected',
                'error' => $e->getMessage()
            ], 503);
        }
    }
}
