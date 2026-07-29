import http.cookiejar
import urllib.request
import urllib.parse

BASE = 'http://127.0.0.1:5000'
USERNAME = 'AlphaCyclops'
PASSWORD = '2kApp!'

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def get(path):
    url = BASE + path
    resp = opener.open(url)
    return resp.read().decode('utf-8')

def post(path, data):
    url = BASE + path
    data_bytes = urllib.parse.urlencode(data).encode('utf-8')
    try:
        resp = opener.open(url, data=data_bytes)
        return resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f'HTTPError {e.code} on POST {path}:')
        print(body)
        raise

print('Visiting login page...')
get('/login')
print('Logging in...')
login_resp = post('/login', {'username': USERNAME, 'password': PASSWORD})
if 'Logged in successfully' not in login_resp and 'Dashboard' not in login_resp:
    print('Login may have failed; checking for redirect to dashboard...')
    # try fetching dashboard
    dash = get('/dashboard')
    if 'Dashboard' not in dash:
        print('Login failed. Response excerpts:')
        print(login_resp[:400])
        raise SystemExit(1)
print('Logged in OK')

print('Opening profile page...')
profile_html = get('/profile')
if 'Profile' not in profile_html:
    print('Profile page did not render (snippet):')
    print(profile_html[:400])
    raise SystemExit(1)

print('Updating profile in-game username...')
post('/profile', {'form_type': 'profile', 'in_game_username': 'TestPlayer'})

print('Adding a build...')
post('/profile', {'form_type': 'build', 'build_name': 'Test Build', 'height': '80', 'position': 'PG'})

print('Verifying build appears on profile page...')
profile_html2 = get('/profile')
if 'Test Build' not in profile_html2:
    print('Build not found on profile page. Snippet:')
    print(profile_html2[:600])
    raise SystemExit(1)
print('Build verified')

print('Logging out...')
get('/logout')

print('Checking we are at login page...')
login_after = get('/login')
if 'Username' not in login_after and 'Log in' not in login_after:
    print('Login page did not render after logout. Snippet:')
    print(login_after[:400])
    raise SystemExit(1)

print('Smoke test completed successfully')
