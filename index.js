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
        const originUrl = `https://github.com${targetPath}`
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
    <meta http-equiv="refresh" content="3; url=${originUrl}">
</head>
<body>
    <div class="emoji">🔐</div>
    <h1>Redirecting to GitHub...</h1>
    <p>You're being redirected to <strong>github.com</strong> to log in or access content.<br>
    <small>This proxy hasn't figured out full GitHub login persistence yet! 😅</small></p>
    <p><a href="${originUrl}">Click here if not redirected (3s)</a></p>
    <script>
        setTimeout(() => window.location.href = '${originUrl}', 3000)
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

    // Replace GitHub logo with custom Furglitch logo
    const customLogo = `
    <svg height="32" width="32" aria-hidden="true" viewBox="-2.5 -2.5 30 30" version="1.1" data-view-component="true" class="octicon octicon-mark-github" style="fill: var(--header-fgColor-logo); stroke: var(--header-fgColor-logo);">
    <g id="github-logo">
        <path d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z"/>
    </g>
    <g id="furglitch-logo" transform="translate(12 8) scale(0.0035) translate(-1900 -900)">
        <path fill-rule="evenodd" d="m1647.8 2604.1c-90.1-90.1-145.9-214.6-145.9-352.2 0-168 127.4-375.1 228.9-540.3 22.8-37 44.3-72 64.1-106.3v-0.1l205.1-355.2 204.3 353.9 0.8 1.4c19.8 34.3 41.3 69.2 64 106.3 101.6 165.1 229 372.3 229 540.3 0 137.6-55.8 262.1-145.9 352.2-90.1 90.1-214.7 145.9-352.2 145.9-137.5 0-262.1-55.8-352.2-145.9z"/>
        <path fill-rule="evenodd" d="m407.9 2178.4c-11.1-127 26.2-258.2 114.6-363.5 108-128.8 338.7-205.6 522.7-266.8 41.3-13.8 80.2-26.7 117.4-40.3h0.1l385.4-140.3-71 402.4-0.3 1.6c-6.9 38.9-12.9 79.5-19.2 122.6-28.4 191.7-64 432.3-172 561-88.4 105.4-211.2 165-338.1 176.1-127 11.1-258.2-26.3-363.6-114.7-105.3-88.4-164.9-211.1-176-338.1z"/>
        <path fill-rule="evenodd" d="m3592.2 2179.4c11.1-127-26.2-258.2-114.6-363.5-108.1-128.8-338.7-205.6-522.7-266.8-41.3-13.8-80.2-26.7-117.4-40.3h-0.1l-385.4-140.3 71 402.4 0.3 1.6c6.9 38.9 12.9 79.5 19.2 122.6 28.4 191.7 64 432.3 172 561 88.4 105.4 211.2 165 338.1 176.1 127 11.1 258.2-26.3 363.6-114.7 105.3-88.4 164.9-211.1 176-338.1z"/>
    </g>
    </svg>`.trim()

    body = body.replace(
        /<svg[^>]*class="octicon octicon-mark-github"[^>]*>[\s\S]*?<\/svg>/,
        customLogo
    )


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
