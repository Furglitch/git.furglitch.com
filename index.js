const GITHUB_HOST = 'github.com'
const USERNAME = 'Furglitch'
const USER_PATH = `/${USERNAME}`

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
	const url = new URL(request.url)
	let path = url.pathname
	if (path === `/${USERNAME}` || path.startsWith(`/${USERNAME}/`)) { // Avoid github.com/Furglitch/Furglitch mapping to git.furglitch.com/Furglitch
		path = path.substring(USERNAME.length + 1) || '/'
	}
	
	// Map to GitHub
	const githubPath = path === '/' ? USER_PATH : USER_PATH + path
	const githubUrl = `https://${GITHUB_HOST}${githubPath}${url.search}`
	const response = await fetch(githubUrl, {
		method: request.method,
		headers: request.headers,
		body: request.body
	})
	const contentType = response.headers.get('content-type') || ''
	if (!contentType.includes('text/html')) {
		return response
	}
	
	let body = await response.text()
	
	// HTML Rewrites
	body = body.replace(/https?:\/\/github\.com\/Furglitch/gi, 'https://git.furglitch.com') // General GitHub links: github.com/Furglitch -> git.furglitch.com
	body = body.replace(/(['"])\/Furglitch\?/g, '$1/?') // Profile tabs: "/Furglitch?tab=..." -> "/?tab=..."
	body = body.replace(/(['"])\/Furglitch\/?(['"])/g, '$1/$2') // Profile root: "/Furglitch" or "/Furglitch/" -> "/"
	
	
	return new Response(body, {
		status: response.status,
		headers: response.headers
	})
}
