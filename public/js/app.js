// Editor Settings (Provided by C9)
const codeEditor = document.getElementById('editor');
const checkbox = document.getElementById('input-checkbox');
const inHeading = document.querySelector('.input-heading');
const tc = document.getElementById('tc-editor');
const opHeading = document.querySelector('.output-heading');
const op = document.getElementById('op-editor');

var beautify = ace.require("ace/ext/beautify");
var editor = ace.edit("editor");
var tcEditor = ace.edit("tc-editor");
var opEditor = ace.edit("op-editor");

var themeName = "ambiance";

var lang_saved_code = {
"cpp" : `#include<bits/stdc++.h>
using namespace std;

int main()
{
    return 0;
}
`,"c" : `
#include <stdio.h>

int main()
{

    return 0;
}
`,"py" : `print('Hello')`,
"js":`console.log('Hello World ');`}

tcEditor.setTheme("ace/theme/".concat(themeName));
tcEditor.setShowPrintMargin(false);
tcEditor.clearSelection();
tcEditor.setFontSize(12);
tcEditor.session.setTabSize(4); 


opEditor.setTheme("ace/theme/".concat(themeName));
opEditor.setAutoScrollEditorIntoView(true);
opEditor.setShowPrintMargin(false);
opEditor.clearSelection();
opEditor.setFontSize(12);
opEditor.setReadOnly(true);
opEditor.setValue("Output : ",1);


editor.setOption("dragEnabled", false)
editor.setAutoScrollEditorIntoView(true);
editor.setTheme("ace/theme/".concat(themeName));
editor.setShowPrintMargin(false);
editor.session.setMode("ace/mode/c_cpp");
editor.setFontSize(16);
editor.session.setTabSize(4); 
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: false,
    enableLiveAutocompletion: true,
    useSoftTabs: true
});

window.addEventListener('load', () => {
    beautify.beautify(editor.session)
  })

function showCode(code,lang)
{
    document.getElementById("lang").value = lang;
    lang_saved_code[lang] = code;
    changeLang();
}

async function changeLang() {
   	var x = document.getElementById("lang");
    var lang = x.options[x.selectedIndex].value;
    var mode;
    if(lang =="c" || lang == "cpp") mode = "c_cpp";
    else if(lang=="cs") mode = "csharp";
    else if(lang=="py") mode = "python";
    else if(lang=="js") mode = "javascript";
    editor.session.setMode("ace/mode/".concat(mode));

    beautify.beautify(editor.session);
    editor.clearSelection();

    editor.setValue(lang_saved_code[lang],1);
    editor.clearSelection();
    beautify.beautify(editor.session);
    document.getElementById('file-lang').textContent = lang;
}

function editFilename()
{
    toggleFilenameInput();
}
function toggleFilenameInput()
{
    document.querySelector('.name-input').classList.toggle("name-input-active");
}
function SaveFilename()
{
    let filename = document.querySelector('.name-input input').value;
    if(filename != "")
    {
        document.getElementById('filename').textContent = filename;
        toggleFilenameInput();
    }
}

async function saveFile()
{
    let name = document.getElementById('filename').textContent;
    let lang = document.getElementById('file-lang').textContent;
    let code = editor.getValue();
    console.log(lang);
    let url = 'save';

    try {
        let res = fetch(url, {
        method: "POST",
        body: JSON.stringify({
            code : code,
            name : name,
            lang : lang
        }),
        
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
        }).then(response => response.json())
        .then(json => {console.log(json);} );
    } 
    catch (error) 
    {
        console.log(error);
    }

}


function changeFontSize()
{
    var size = parseInt(document.getElementById('fontSize').value);
    if (size >= 10 && size<=30)
        editor.setFontSize(size);
}
function changeTheme()
{
    themeName = document.getElementById('theme').value;
    editor.setTheme("ace/theme/".concat(themeName));
    tcEditor.setTheme("ace/theme/".concat(themeName));
}
function changeTabSize()
{
    var tabsize = parseInt(document.getElementById('tab-size').value);
    editor.session.setTabSize(tabsize); 
}
function toggleSettingMenu()
{
    document.querySelector('.setting-menu').classList.toggle("menu-active");
}

function toggleInput()
{

    if(checkbox.checked)
    {
        tc.style.display = "block";
        inHeading.style.display = "block";
        op.style.display = "none";
        opHeading.style.display = "none";
    }
    else
    {
        op.style.display = "block";
        opHeading.style.display = "block";
        tc.style.display = "none";
        inHeading.style.display = "none";
    }
}
async function runCode()
{
    var x = document.getElementById("lang");
    var lang = x.options[x.selectedIndex].value;
    var textCode = editor.getValue();
    var input = tcEditor.getValue();
    output = await getOutput(textCode,input,lang,showOutput); 
}


async function showOutput(output)
{
    console.log(output);
    checkbox.checked = false;
    toggleInput();
    opEditor.setValue("");
    opEditor.session.insert({row : 0,column : 0},output);
}

async function getOutput(code,input,lang,cb) 
{
    console.log(lang);
    let url = '/home/code/run';
    try {
        let res = fetch(url, {
        method: "POST",
        body: JSON.stringify({
            code : code,
            input : input,
            lang : lang
        }),
        
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
        }).then(response => response.json())
        .then(json => {console.log(json); return cb(json.output);});
    } 
    catch (error) 
    {
        return cb(error);
    }
}