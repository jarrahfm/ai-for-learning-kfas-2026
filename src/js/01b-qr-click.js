/* every QR code in the deck is also a clickable link to the URL it encodes */
(function(){
  var Q=window.QRCode;if(!Q||!Q.prototype.makeCode)return;
  function mark(el,url){
    if(!el||!url)return;
    el.dataset.qrUrl=url;el.classList.add('qr-link');el.title='Click to open: '+url;
    if(el._qrBound)return;el._qrBound=1;el.setAttribute('role','link');el.tabIndex=0;
    function go(e){e.preventDefault();e.stopPropagation();window.open(el.dataset.qrUrl,'_blank','noopener');}
    el.addEventListener('click',go);
    el.addEventListener('keydown',function(e){if(e.key==='Enter'){go(e);}});
  }
  var mk=Q.prototype.makeCode;
  Q.prototype.makeCode=function(t){try{mark(this._el,t);}catch(e){}return mk.apply(this,arguments);};
})();
