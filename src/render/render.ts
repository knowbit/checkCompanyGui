"use strict"

{
  const date = new Date();
  let day = String(date.getDate());
  let month = String(date.getMonth() + 1);
  let year = String(date.getFullYear());

  day = day.length === 1 ? `0${day}` : day;
  month = month.length === 1 ? `0${month}` : month;

  let currentDate = `${year}-${month}-${day}`;

  (document.querySelector('#startDate') as HTMLInputElement)
    .setAttribute('value', currentDate);
  (document.querySelector('#startDate') as HTMLInputElement)
    .setAttribute('max', currentDate);

  (document.querySelector('#stopDate') as HTMLInputElement)
    .setAttribute('value', currentDate);
  (document.querySelector('#stopDate') as HTMLInputElement)
    .setAttribute('max', currentDate);
}

function clickCheckBox(elem: HTMLInputElement) {
  const checkboxType = document.querySelectorAll('.checkboxType');
  for (let ch of checkboxType) {
    const check = ch as HTMLInputElement;
    if (elem.name === check.name) { continue }
    check.checked = false;
  }
}

document.getElementById('selectList')?.addEventListener('focusout', function() {
  const selectList = document.getElementById('selectList') as HTMLInputElement;
  selectList.style.display = 'none';
});

function clickSearch() {
  const selectList = document.getElementById('selectList') as HTMLInputElement;
  const inputText = document.getElementById('inputText') as HTMLInputElement;
  inputText.value = '';
  filterOptions();
  selectList.focus();
}

document.getElementById('selectList')?.addEventListener('click', function() {
  const selectList = document.getElementById('selectList') as HTMLInputElement;
  selectList.focus();
  const inputText = document.getElementById('inputText') as HTMLInputElement;
  inputText.value = (document.querySelector(`option[value=${selectList.value}]`) as HTMLInputElement).innerText;
  selectList.style.display = 'none';
});

document.getElementById('inputText')?.addEventListener('focusout', function() {
  const inputText = document.getElementById('inputText') as HTMLInputElement;
  const selectList = document.getElementById('selectList') as HTMLInputElement;
  const valueText = (document.querySelector(`option[value=${selectList.value}]`) as HTMLInputElement).innerText;
  if (valueText != inputText.value) {
    inputText.value = '';
  }
});

function filterOptions() {
  const inputText = (document.getElementById('inputText') as HTMLInputElement).value.toLowerCase();
  const selectList = document.getElementById('selectList') as HTMLInputElement;
  const options = selectList.getElementsByTagName('option');
  let size = 0;
  for (let i = 0; i < options.length; i++) {
    const optionText = options[i].text.toLowerCase();
    if (optionText.includes(inputText)) {
      options[i].style.display = 'block';
      size += 1;
    } else {
      options[i].style.display = 'none';
    }
  }
  if (size > 0) {
    selectList.style.display = 'block';
  } else {
    selectList.style.display = 'none';
  }

  if (size < 11) {
    selectList.size = size;
  } else {
    selectList.size = 10;
  }
}
