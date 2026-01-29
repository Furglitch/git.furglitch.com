const GITHUB_HOST = 'github.com'
const CUSTOM_URL = 'git.furglitch.com'
const USERNAME = 'Furglitch'
const USER_PATH = `/${USERNAME}`
const CSS_URL = 'https://raw.githubusercontent.com/Furglitch/git.furglitch.com/main/assets/css/catppuccin.css'

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)
    let path = url.pathname

    if (path === `/${USERNAME}` || path.startsWith(`/${USERNAME}/`)) {
        path = path.substring(USERNAME.length + 1) || '/'
    }

    const githubPath = path === '/' ? USER_PATH : USER_PATH + path
    const githubUrl = `https://${GITHUB_HOST}${githubPath}${url.search}`

    const response = await fetch(githubUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
    })

    if (response.status === 404) {
        const targetPath = url.pathname + url.search
        const githubLoginUrl = `https://github.com${targetPath}`
        const messagePage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting to GitHub...</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 500px; margin: 100px auto; padding: 40px; 
            text-align: center; background: #1e1e2e; color: #cdd6f4;
            border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        a { color: #89b4fa; text-decoration: none; font-weight: 600; }
        a:hover { color: #cba6f7; }
        .emoji { font-size: 2em; margin-bottom: 20px; }
    </style>
    <meta http-equiv="refresh" content="3; url=${githubUrl}">
</head>
<body>
    <div class="emoji">🔐</div>
    <h1>Redirecting to GitHub...</h1>
    <p>You're being redirected to <strong>github.com</strong> to log in or access content.<br>
    <small>This proxy hasn't figured out full GitHub login persistence yet! 😅</small></p>
    <p><a href="${githubUrl}">Click here if not redirected (3s)</a></p>
    <script>
        setTimeout(() => window.location.href = '${githubUrl}', 3000)
    </script>
</body>
</html>`.trim()
        return new Response(messagePage, {
        headers: { 'content-type': 'text/html;charset=UTF-8' }
    , status: 302 })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
        return response
    }

    let body = await response.text() // Swap github links to custom domain
    body = body.replace(new RegExp(`https?:\/\/${GITHUB_HOST}\/${USERNAME}`, 'gi'), `https://${CUSTOM_URL}`)
    body = body.replace(new RegExp(`(['"])\/${USERNAME}\\?`, 'g'), '$1/?')
    body = body.replace(new RegExp(`(['"])\/${USERNAME}\/?(['"])`, 'g'), '$1/$2')

    // Fetch and inject CSS
    const cssResponse = await fetch(CSS_URL)
    const cssContent = await cssResponse.text()
    body = body.replace('</head>', `<style>${cssContent}</style></head>`)
    return new Response(body, {
        status: response.status,
        headers: {
            ...Object.fromEntries(response.headers),
            'content-type': 'text/html',
        }
    })
}
