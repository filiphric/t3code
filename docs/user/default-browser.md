# Use T3 Code as your default browser

On macOS, the desktop app can be your default web browser. Links you open from other apps then
open in T3 Code. When the thread on screen shows its browser panel, the link opens there as a new
tab. Otherwise it starts a new thread without a project, with the browser panel maximized on the
page, so you can ask an agent about it right away.

Choose **T3 Code** under **System Settings → Desktop & Dock → Default web browser**. To go back,
choose another browser there.

Pull request links for a connected project open in the pull request view when opening pull
request links in the app is enabled. Other links still open in the browser panel.

HTML files you open from Finder open the same way. [Prompt links](prompt-links.md) to
app.t3.codes open in the app as a draft.

A link that launches T3 Code waits until the app has connected to its environment, then opens.

## Open links in other apps

On web and desktop, add scheme names under **Settings → Browser → App links → Allowed app
schemes**, separated by commas, for example `things, obsidian`. Clicking matching chat links
opens the app on the device where you click. The app must be installed. Your browser may ask
before opening it. These permissions apply only to this client; remove a name to revoke it.

Allow only apps you trust: their links may perform actions as well as navigate. Executable,
embedded-content, and reserved file/editor schemes cannot be added.
