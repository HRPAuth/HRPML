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
        const result = await Neutralino.os.execCommand(command);
        if (result.stdOut) {
            output.textContent += result.stdOut;
        }
        if (result.stdErr) {
            output.textContent += '\nSTDERR: ' + result.stdErr;
        }
        if (!result.stdOut && !result.stdErr) {
            output.textContent += '\n(Command completed with no output)';
        }
        output.textContent += '\nExit code: ' + result.exitCode;
    } catch (error) {
        output.textContent += '\nError: ' + error.message;
    }
});