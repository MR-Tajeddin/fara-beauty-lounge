const menus={Haircuts:[["Women’s haircut and style","from $80"],["Men’s haircut","from $50"],["Fade haircut","from $60"],["Girls’ cut","from $60"],["Boys’ cut","from $50"],["Wash and blow-dry","from $50"]],Colour:[["Root touch-up","from $80"],["Full head colour","from $110"],["INOA root touch-up","from $90"],["INOA full head colour","from $120"],["10-minute root touch-up","from $90"],["Men’s shade colour","$50"],["Tailored colour restoration","Consultation"]],Highlights:[["Half-head highlights","from $190"],["Full-head highlights","from $230"],["Toner","from $50"],["Balayage","from $250"],["Ombré","from $230"]],Treatments:[["Keratin straightening","from $400"],["Hair Botox","from $200"],["Permanent wave · consultation required","from $200"],["Spiral perm","Consultation"],["Olaplex treatment","$45"],["Deep conditioning treatment","$35"],["Metal detox treatment","$45"]],Styling:[["Formal updo","from $100"],["Natural hair extensions","Enquire"],["Tape-in extensions","Enquire"],["Fusion extensions","Enquire"],["Microlink extensions","Enquire"],["Clip-in extensions","Enquire"]],Beauty:[["Eyebrow tinting","$25"],["Full-face threading, including brows","$50"],["Eyebrow threading","$25"],["Upper lip","$15"],["Chin and neck","$18"],["Day makeup","$60"],["Evening makeup","$75"],["Special occasion makeup","$120"],["Eyelash extension","$30"],["Eyelash extensions · 3 weeks","$150"]],Packages:[["Colouring + blow-dry","$135"],["5 wash-and-blow-dry visits · ask for details","from $150"],["Bridal: wash, blow-dry, updo & makeup","from $499"]]};

// Service menu: preserve the published prices and keyboard navigation.
const categories = document.querySelector('.categories');
Object.keys(menus).forEach((name, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('role', 'tab');
  button.id = 'tab-' + index;
  button.setAttribute('aria-controls', 'price-panel');
  button.textContent = name;
  button.addEventListener('click', () => select(name));
  categories.appendChild(button);
});
function select(name) {
  if (!menus[name]) return;
  [...categories.children].forEach(button => {
    const selected = button.textContent === name;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected) document.querySelector('#price-panel').setAttribute('aria-labelledby', button.id);
  });
  document.querySelector('#price-list').replaceChildren(...menus[name].map(([label, price]) => {
    const row = document.createElement('div');
    row.className = 'price-row';
    const labelElement = document.createElement('span');
    const priceElement = document.createElement('span');
    labelElement.textContent = label;
    priceElement.textContent = price;
    row.append(labelElement, priceElement);
    return row;
  }));
}
categories.addEventListener('keydown', event => {
  const buttons = [...categories.children];
  let index = buttons.indexOf(document.activeElement);
  if (index < 0 || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
    (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
  select(buttons[index].textContent);
  buttons[index].focus();
});
select('Haircuts');
document.querySelectorAll('[data-category]').forEach(link => link.addEventListener('click', () => select(link.dataset.category)));
const categoryLayout = window.matchMedia('(max-width: 600px)');
function updateTabOrientation() { categories.setAttribute('aria-orientation', categoryLayout.matches ? 'horizontal' : 'vertical'); }
updateTabOrientation();
categoryLayout.addEventListener('change', updateTabOrientation);

// Compact navigation with Escape, outside-click and resize support.
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('navigation');
function closeNavigation() {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('click', event => {
  if (!nav.contains(event.target) && !toggle.contains(event.target)) closeNavigation();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeNavigation();
    toggle.focus();
  }
});
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeNavigation(); });
document.getElementById('year').textContent = new Date().getFullYear();

// The supplied promotion is for October 2026, in the salon's Toronto timezone.
const offerStart = Date.parse('2026-10-01T00:00:00-04:00');
const offerEnd = Date.parse('2026-11-01T00:00:00-04:00');
const offerDialog = document.getElementById('offer-dialog');
let autoOfferTimer;
let arrivalOfferPending = true;
function offerIsActive(now = Date.now()) { return now >= offerStart && now < offerEnd; }
function cancelAutoOffer() { window.clearTimeout(autoOfferTimer); }
function openOffer(autoClose = false) {
  cancelAutoOffer();
  if (!offerIsActive() || offerDialog.open || typeof offerDialog.showModal !== 'function') return;
  closeNavigation();
  offerDialog.showModal();
  document.body.classList.add('dialog-open');
  if (autoClose) autoOfferTimer = window.setTimeout(closeOffer, 5000);
}
function closeOffer() {
  cancelAutoOffer();
  if (offerDialog.open) offerDialog.close();
}
offerDialog.querySelector('.offer-close').addEventListener('click', closeOffer);
offerDialog.querySelector('.offer-dismiss').addEventListener('click', closeOffer);
offerDialog.querySelector('a').addEventListener('click', closeOffer);
offerDialog.addEventListener('close', () => {
  cancelAutoOffer();
  document.body.classList.remove('dialog-open');
});
offerDialog.addEventListener('click', event => {
  const rect = offerDialog.getBoundingClientRect();
  if (event.target === offerDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeOffer();
});
document.querySelectorAll('[data-open-offer]').forEach(button => button.addEventListener('click', () => openOffer()));
function refreshOffer() {
  const active = offerIsActive();
  document.querySelectorAll('[data-seasonal]').forEach(element => { element.hidden = !active; });
  if (!active) { cancelAutoOffer(); closeOffer(); }
}
refreshOffer();
function showArrivalOffer() {
  if (!arrivalOfferPending || document.visibilityState !== 'visible') return;
  arrivalOfferPending = false;
  openOffer(true);
}
// Show on every page load, then close after five seconds. The offer button can
// reopen it without a time limit so visitors can read and book at their own pace.
showArrivalOffer();
document.addEventListener('visibilitychange', () => {
  refreshOffer();
  showArrivalOffer();
});
window.setInterval(refreshOffer, 60000);
