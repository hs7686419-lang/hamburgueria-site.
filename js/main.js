/* =========================================================================
   DADOS — única fonte de verdade do cardápio (nome, descrição, preço).
   Preços em centavos. A seção 3D lê daqui; nada é duplicado.
   ========================================================================= */
const CARDAPIO = [
  {id:'classic-smash',    cat:'burgers', emoji:'🍔', nome:'Classic Smash',      desc:'Duplo smash, cheddar artesanal, picles, molho especial', preco:3490},
  {id:'brasa-bbq',        cat:'burgers', emoji:'🥓', nome:'Brasa BBQ',          desc:'Blend premium, bacon defumado, cebola caramelizada, molho BBQ', preco:3990},
  {id:'trufada-premium',  cat:'burgers', emoji:'🍄', nome:'Trufada Premium',    desc:'Blend angus, queijo brie, cogumelo, molho trufado', preco:4790},
  {id:'margherita',       cat:'pizzas',  emoji:'🍕', nome:'Margherita da Casa', desc:'Molho san marzano, fior di latte, manjericão fresco', preco:4290},
  {id:'pepperoni',        cat:'pizzas',  emoji:'🍕', nome:'Pepperoni Artesanal',desc:'Pepperoni importado, queijo cremoso, borda recheada', preco:4890},
  {id:'combo-familia',    cat:'combos',  emoji:'🍟', nome:'Combo Família',      desc:'2 burgers + 1 pizza + 4 bebidas', preco:12990}
];

/* =========================================================================
   RECEITAS DA EXPERIÊNCIA 3D — EDITE AQUI para refletir a receita real.
   • A chave é o `id` do lanche em CARDAPIO.
   • `camadas` é listada DE CIMA PARA BAIXO, como você vê o lanche.
   • `tipo` escolhe o modelo 3D. Disponíveis:
       paoSuperior (gergelim:true/false) · paoInferior · smash · blend
       cheddar · brie · picles · molho (cor:'especial'|'bbq'|'trufado'|'#hex')
       cebolaCaramelizada · bacon · cogumelo · alface · tomate
   • Só estão aqui os ingredientes que constam no cardápio (os pães são
     inerentes a um hambúrguer; confirme o tipo de pão e ajuste o texto).
   ========================================================================= */
const RECEITAS_3D = {
  'classic-smash': { camadas: [
    {tipo:'paoSuperior', nome:'Pão superior',            desc:'Macio por dentro, dourado por fora.'},
    {tipo:'molho', cor:'especial', nome:'Molho especial', desc:'Cremosidade e sabor exclusivo da casa.'},
    {tipo:'picles',     nome:'Picles',                   desc:'Toque ácido que equilibra o sabor.'},
    {tipo:'smash',      nome:'Smash (2ª carne)',         desc:'Carne amassada na chapa, com bordas douradas.'},
    {tipo:'cheddar',    nome:'Cheddar artesanal',        desc:'Derretido e cremoso entre as duas carnes.'},
    {tipo:'smash',      nome:'Smash (1ª carne)',         desc:'Carne amassada na chapa, com bordas douradas.'},
    {tipo:'paoInferior',nome:'Pão inferior',             desc:'Base firme que sustenta cada camada.'}
  ]},
  'brasa-bbq': { camadas: [
    {tipo:'paoSuperior', nome:'Pão superior',            desc:'Macio por dentro, dourado por fora.'},
    {tipo:'molho', cor:'bbq', nome:'Molho BBQ',           desc:'Defumado e levemente adocicado.'},
    {tipo:'bacon',      nome:'Bacon defumado',           desc:'Sabor defumado e textura crocante.'},
    {tipo:'cebolaCaramelizada', nome:'Cebola caramelizada', desc:'Doce, macia e dourada.'},
    {tipo:'blend',      nome:'Blend premium',            desc:'Hambúrguer grelhado e suculento.'},
    {tipo:'paoInferior',nome:'Pão inferior',             desc:'Base firme que sustenta cada camada.'}
  ]},
  'trufada-premium': { camadas: [
    {tipo:'paoSuperior', nome:'Pão superior',            desc:'Macio por dentro, dourado por fora.'},
    {tipo:'molho', cor:'trufado', nome:'Molho trufado',   desc:'Aroma intenso e sofisticado de trufa.'},
    {tipo:'cogumelo',   nome:'Cogumelo',                 desc:'Sabor terroso que combina com o trufado.'},
    {tipo:'brie',       nome:'Queijo brie',              desc:'Cremoso e suave, derrete sobre a carne.'},
    {tipo:'blend',      nome:'Blend angus',              desc:'Hambúrguer grelhado e suculento.'},
    {tipo:'paoInferior',nome:'Pão inferior',             desc:'Base firme que sustenta cada camada.'}
  ]}
};

/* =========================================================================
   PEDIDO — carrinho simples, finaliza pelo WhatsApp.
   `Pedido.add(id)` é o ponto de integração usado por TODOS os botões
   "Pedir agora" (inclusive o da experiência 3D).
   Defina o número abaixo (DDI+DDD+número, só dígitos) para pedidos irem direto à loja.
   ========================================================================= */
const WHATSAPP_NUMERO = '';
const brl = c => (c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const Pedido = (() => {
  let itens = {};
  try { itens = JSON.parse(localStorage.getItem('bm-pedido') || '{}'); } catch(e){}
  const $ = id => document.getElementById(id);
  const save = () => { try { localStorage.setItem('bm-pedido', JSON.stringify(itens)); } catch(e){} };
  const find = id => CARDAPIO.find(i => i.id === id);
  itens = Object.fromEntries(Object.entries(itens).filter(([id,q]) => find(id) && q > 0));
  function render(){
    const ids = Object.keys(itens), n = ids.reduce((s,i)=>s+itens[i],0);
    const cc = $('cartCount'); cc.textContent = n || ''; cc.dataset.n = n;
    const list = $('dList'); list.textContent = '';
    if(!ids.length){ list.innerHTML = '<li class="d-empty">Seu pedido está vazio.<br>Escolha um item no cardápio.</li>'; }
    ids.forEach(id => {
      const it = find(id), li = document.createElement('li'); li.className = 'd-item';
      li.innerHTML = '<span class="e"></span><b></b><span class="q"><button type="button" aria-label="Diminuir">−</button><span></span><button type="button" aria-label="Aumentar">+</button></span><small></small>';
      li.children[0].textContent = it.emoji; li.children[1].textContent = it.nome;
      li.querySelector('.q span').textContent = itens[id];
      li.children[3].textContent = brl(it.preco * itens[id]);
      const [m,p] = li.querySelectorAll('.q button'); m.onclick = () => change(id,-1); p.onclick = () => change(id,1);
      list.appendChild(li);
    });
    $('dTotal').textContent = brl(ids.reduce((s,i)=>s+find(i).preco*itens[i],0));
  }
  function change(id,d){ itens[id] = Math.max(0,(itens[id]||0)+d); if(!itens[id]) delete itens[id]; save(); render(); }
  function open(on=true){ $('drawer').classList.toggle('on',on); $('scrim').classList.toggle('on',on); $('drawer').setAttribute('aria-hidden',String(!on)); if(on) $('drawerClose').focus(); }
  let tt; function toast(t){ const e=$('toast'); e.textContent=t; e.classList.add('on'); clearTimeout(tt); tt=setTimeout(()=>e.classList.remove('on'),2200); }
  function add(id, abrir){ if(!find(id)) return; change(id,1); if(abrir) open(); else toast(find(id).nome + ' adicionado ao pedido'); }
  $('cartBtn').onclick = () => open(); $('drawerClose').onclick = $('scrim').onclick = () => open(false);
  document.addEventListener('keydown', e => { if(e.key==='Escape') open(false); });
  $('dCheckout').onclick = () => {
    const ids = Object.keys(itens); if(!ids.length){ toast('Adicione itens ao pedido primeiro'); return; }
    const linhas = ids.map(i => `${itens[i]}x ${find(i).nome} — ${brl(find(i).preco*itens[i])}`);
    const total = brl(ids.reduce((s,i)=>s+find(i).preco*itens[i],0));
    const msg = `Olá! Quero fazer um pedido na Brasa & Massa:\n${linhas.join('\n')}\nTotal: ${total}`;
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  };
  render();
  return { add, open };
})();
window.Pedido = Pedido; window.CARDAPIO = CARDAPIO; window.RECEITAS_3D = RECEITAS_3D;

/* ---- destaques, cardápio e filtros ---- */
(() => {
  const mk = (it, cls) => {
    const el = document.createElement('article'); el.className = cls;
    if(cls === 'hl-card') el.innerHTML = '<div class="hl-emoji" aria-hidden="true"></div><h3></h3><p></p><span class="price"></span><button class="btn btn-red" type="button">Pedir agora</button>';
    else el.innerHTML = '<div class="pic" aria-hidden="true"></div><h3></h3><p></p><span class="price"></span><button class="btn btn-red" type="button">Pedir agora</button>';
    el.children[0].textContent = it.emoji; el.children[1].textContent = it.nome; el.children[2].textContent = it.desc; el.children[3].textContent = brl(it.preco);
    el.querySelector('button').onclick = () => Pedido.add(it.id);
    return el;
  };
  const hl = document.getElementById('hlGrid');
  CARDAPIO.filter(i => i.cat === 'burgers').forEach(i => hl.appendChild(mk(i,'hl-card')));
  const grid = document.getElementById('menuGrid');
  function draw(cat){
    grid.textContent = '';
    const list = CARDAPIO.filter(i => cat === 'todos' || i.cat === cat);
    if(!list.length){ const p=document.createElement('p'); p.className='empty'; p.textContent='Nenhum item nesta categoria no momento.'; grid.appendChild(p); }
    list.forEach(i => grid.appendChild(mk(i,'card')));
  }
  document.getElementById('filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    document.querySelectorAll('#filters button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    draw(b.dataset.cat);
  });
  draw('todos');
  const f = CARDAPIO.find(i => i.id === 'brasa-bbq');
  document.getElementById('ftName').textContent = f.nome;
  document.getElementById('ftDesc').textContent = f.desc + '. Montado na hora, servido quente.';
  f.desc.split(', ').forEach(t => { const li=document.createElement('li'); li.textContent=t; document.getElementById('ftChips').appendChild(li); });
  document.getElementById('ftPrice').textContent = brl(f.preco);
  document.getElementById('ftBtn').onclick = () => Pedido.add(f.id, true);
})();

/* ---- carregamento sob demanda da experiência 3D (Three.js ~600 KB só quando a seção se aproxima) ---- */
(() => {
  const root = document.getElementById('camadas');
  let started = false;
  function load(src){ return new Promise((ok,err) => { const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=err; document.head.appendChild(s); }); }
  function fallback(){
    root.classList.add('b3d-fallback');
    root.querySelector('[data-b3d="loading"]').hidden = true;
    const box = root.querySelector('[data-b3d="ings"]'); box.hidden = false;
    const tabs = root.querySelector('[data-b3d="tabs"]'), buy = root.querySelector('[data-b3d="buy"]');
    function show(id){
      const it = CARDAPIO.find(i=>i.id===id); box.textContent='';
      const ol=document.createElement('ol'); ol.className='b3d-ing';
      RECEITAS_3D[id].camadas.forEach(c => { const li=document.createElement('li'); li.innerHTML='<button type="button" tabindex="-1"><b></b><span></span></button>'; li.querySelector('b').textContent=c.nome; li.querySelector('span').textContent=c.desc; ol.appendChild(li); });
      box.appendChild(ol);
      buy.querySelector('[data-b3d="buy-name"]').textContent=it.nome; buy.querySelector('[data-b3d="buy-desc"]').textContent=it.desc; buy.querySelector('[data-b3d="buy-price"]').textContent=brl(it.preco);
      buy.querySelector('[data-b3d="buy-btn"]').onclick=()=>Pedido.add(id); buy.classList.add('on');
    }
    tabs.textContent='';
    Object.keys(RECEITAS_3D).forEach((id,k) => { const b=document.createElement('button'); b.type='button'; b.textContent=CARDAPIO.find(i=>i.id===id).nome; b.onclick=()=>{[...tabs.children].forEach(x=>x.classList.toggle('on',x===b)); show(id);}; tabs.appendChild(b); if(!k){ b.classList.add('on'); show(id);} });
  }
  function start(){
    if(started) return; started = true;
    load('vendor/three.min.js').then(() => load('js/burger3d.js')).then(() => window.BurgerExperience.init()).catch(fallback);
  }
  window.__b3dStart = start;
  if('IntersectionObserver' in window){
    new IntersectionObserver((en, o) => { if(en[0].isIntersecting){ o.disconnect(); start(); } }, {rootMargin:'700px 0px'}).observe(root);
  } else start();
})();
