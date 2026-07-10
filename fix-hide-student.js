// This script applies fix #4 - hiding the student select in openEnrollmentModalForStudent
// Run: node fix-hide-student.js
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'painel-x9k2f.html');
let content = fs.readFileSync(filePath, 'utf8');

const oldText = '// Para simplificar a UX, vamos esconder a sele\u00e7\u00e3o de aluno se estivermos criando pra ele espec\u00edfico';
const newText = '// Hide the student select since we already know who the student is\n                const studentSelectGroup = form.querySelector(\'[name="student_id"]\').closest(\'div\');\n                if (studentSelectGroup) {\n                    studentSelectGroup.style.display = \'none\';\n                }';

if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS: Fix #4 applied.');
} else {
    console.log('FAIL: Could not find the target text.');
    const idx = content.indexOf('openEnrollmentModalForStudent');
    if (idx >= 0) {
        console.log('Function found at byte', idx);
        const context = content.substring(idx, idx + 300);
        console.log('Context:', JSON.stringify(context));
    }
}
