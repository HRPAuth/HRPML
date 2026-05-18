Neutralino.init();

document.getElementById('shell-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const commandInput = document.getElementById('command-input');
    const output = document.getElementById('output');
    const command = commandInput.value.trim();

    if (!command) {
        output.textContent = 'Error: No command entered';
        return;
    }

    output.textContent = 'Executing...\n';

    try {
        const result = await Neutralino.os.exec(command);
        if (result.stdout) {
            output.textContent += result.stdout;
        }
        if (result.stderr) {
            output.textContent += '\nSTDERR: ' + result.stderr;
        }
        if (!result.stdout && !result.stderr) {
            output.textContent += '\n(Command completed with no output)';
        }
        output.textContent += '\nExit code: ' + result.exitCode;
    } catch (error) {
        output.textContent += '\nError: ' + error.message;
    }
});