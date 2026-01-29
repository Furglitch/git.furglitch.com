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
        return Response.redirect(githubLoginUrl, 302)
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
