import { Hono } from "hono";
import { basicAuthMiddleware, adminAuthMiddleware } from "../middlewares/auth.middleware";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { userDb } from "../database/db";
import { HTTPException } from "hono/http-exception";

export const createAdminController = () => {
  const app = new Hono();

  // Apply basic auth to all admin routes
  app.use("*", basicAuthMiddleware());
  app.use("*", adminAuthMiddleware());

  // Get all users
  app.get("/users", async (c) => {
    const users = userDb.getAllUsers();
    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    return c.json({
      data: sanitizedUsers,
    });
  });

  // Create new user
  const createUserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(4),
  });

  app.post(
    "/users",
    requestValidator("json", createUserSchema),
    async (c) => {
      const payload = c.req.valid("json");

      // Check if user already exists
      const existingUser = userDb.getUserByUsername(payload.username);
      if (existingUser) {
        throw new HTTPException(400, {
          message: "Username already exists",
        });
      }

      const user = userDb.createUser(payload.username, payload.password);
      const { password, ...sanitizedUser } = user;

      return c.json({
        data: sanitizedUser,
      });
    }
  );

  // Update user password
  const updatePasswordSchema = z.object({
    password: z.string().min(4),
  });

  app.put(
    "/users/:id/password",
    requestValidator("json", updatePasswordSchema),
    async (c) => {
      const userId = parseInt(c.req.param("id"));
      const payload = c.req.valid("json");

      const user = userDb.getUserById(userId);
      if (!user) {
        throw new HTTPException(404, {
          message: "User not found",
        });
      }

      if (user.is_admin === 1) {
        throw new HTTPException(400, {
          message: "Cannot change admin password through this endpoint",
        });
      }

      userDb.updateUserPassword(userId, payload.password);

      return c.json({
        data: {
          message: "Password updated successfully",
        },
      });
    }
  );

  // Delete user
  app.delete("/users/:id", async (c) => {
    const userId = parseInt(c.req.param("id"));

    const user = userDb.getUserById(userId);
    if (!user) {
      throw new HTTPException(404, {
        message: "User not found",
      });
    }

    if (user.is_admin === 1) {
      throw new HTTPException(400, {
        message: "Cannot delete admin user",
      });
    }

    userDb.deleteUser(userId);

    return c.json({
      data: {
        message: "User deleted successfully",
      },
    });
  });

  // Admin UI
  app.get("/", async (c) => {
    return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - WA Gateway</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
        }
        
        .card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #f0f0f0;
        }
        
        th {
            background: #f8f9fa;
            color: #333;
            font-weight: 600;
        }
        
        .btn-delete {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 6px 12px;
            font-size: 12px;
        }
        
        .btn-change-password {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 6px 12px;
            font-size: 12px;
            margin-right: 5px;
        }
        
        .message {
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .badge.admin {
            background: #ffd700;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Admin Panel</h1>
            <p class="subtitle">WhatsApp Gateway User Management</p>
        </div>
        
        <div class="card">
            <h2>➕ Create New User</h2>
            <div id="createMessage"></div>
            <form id="createUserForm">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required minlength="3">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required minlength="4">
                </div>
                <button type="submit">Create User</button>
            </form>
        </div>
        
        <div class="card">
            <h2>👥 Users</h2>
            <div id="usersMessage"></div>
            <table id="usersTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr>
                        <td colspan="4" style="text-align: center;">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        const authHeader = 'Basic ' + btoa(prompt('Username:') + ':' + prompt('Password:'));
        
        function showMessage(elementId, message, type) {
            const el = document.getElementById(elementId);
            el.innerHTML = '<div class="message ' + type + '">' + message + '</div>';
            setTimeout(() => {
                el.innerHTML = '';
            }, 5000);
        }
        
        async function loadUsers() {
            try {
                const response = await fetch('/admin/users', {
                    headers: {
                        'Authorization': authHeader
                    }
                });
                
                const data = await response.json();
                const tbody = document.getElementById('usersTableBody');
                
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No users found</td></tr>';
                    return;
                }
                
                tbody.innerHTML = data.data.map(user => {
                    const isAdmin = user.is_admin === 1;
                    return \`
                        <tr>
                            <td>\${user.id}</td>
                            <td>
                                \${user.username}
                                \${isAdmin ? '<span class="badge admin">ADMIN</span>' : ''}
                            </td>
                            <td>\${new Date(user.created_at).toLocaleString()}</td>
                            <td>
                                \${!isAdmin ? \`
                                    <button class="btn-change-password" onclick="changePassword(\${user.id}, '\${user.username}')">Change Password</button>
                                    <button class="btn-delete" onclick="deleteUser(\${user.id}, '\${user.username}')">Delete</button>
                                \` : '-'}
                            </td>
                        </tr>
                    \`;
                }).join('');
            } catch (error) {
                showMessage('usersMessage', 'Failed to load users: ' + error.message, 'error');
            }
        }
        
        document.getElementById('createUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                username: formData.get('username'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/admin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('createMessage', 'User created successfully!', 'success');
                    e.target.reset();
                    loadUsers();
                } else {
                    showMessage('createMessage', result.message || 'Failed to create user', 'error');
                }
            } catch (error) {
                showMessage('createMessage', 'Error: ' + error.message, 'error');
            }
        });
        
        async function deleteUser(id, username) {
            if (!confirm('Are you sure you want to delete user "' + username + '"?')) {
                return;
            }
            
            try {
                const response = await fetch('/admin/users/' + id, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': authHeader
                    }
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('usersMessage', 'User deleted successfully!', 'success');
                    loadUsers();
                } else {
                    showMessage('usersMessage', result.message || 'Failed to delete user', 'error');
                }
            } catch (error) {
                showMessage('usersMessage', 'Error: ' + error.message, 'error');
            }
        }
        
        async function changePassword(id, username) {
            const newPassword = prompt('Enter new password for "' + username + '":');
            if (!newPassword || newPassword.length < 4) {
                alert('Password must be at least 4 characters long');
                return;
            }
            
            try {
                const response = await fetch('/admin/users/' + id + '/password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    },
                    body: JSON.stringify({ password: newPassword })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('usersMessage', 'Password updated successfully!', 'success');
                } else {
                    showMessage('usersMessage', result.message || 'Failed to update password', 'error');
                }
            } catch (error) {
                showMessage('usersMessage', 'Error: ' + error.message, 'error');
            }
        }
        
        // Load users on page load
        loadUsers();
    </script>
</body>
</html>
    `);
  });

  return app;
};
