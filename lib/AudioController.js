
function AudioController(){

  //if( 
 /* try {
    window.AudioContext = window.AudioContext;//||window.webkitAudioContext;
  }catch(e) {
    alert( 'WEB AUDIO API NOT SUPPORTED' );
  }*/
 
  this.ctx      = new AudioContext();

  var _ctx = this.ctx;

  // Build a "start audio" button, show it only if autoplay was blocked
  var btn = document.createElement( 'div' );
  btn.innerText = 'click to start song';
  btn.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);padding:12px 24px;background:rgba(255,255,255,0.15);color:#fff;font-family:monospace;font-size:14px;letter-spacing:0.1em;border:1px solid rgba(255,255,255,0.4);border-radius:4px;cursor:pointer;z-index:9999;display:none;';
  document.body.appendChild( btn );

  // Show button after a short delay if audio context is still suspended
  setTimeout( function(){
    if( _ctx.state === 'suspended' ) btn.style.display = 'block';
  }, 500 );

  function unlock(){
    if( _ctx.state === 'suspended' ){ _ctx.resume(); console.log( 'audio context resumed' ); }
    else { console.log( 'audio context already running:', _ctx.state ); }
    if( typeof ULTIMATE_STREAM !== 'undefined' && ULTIMATE_STREAM.paused ){ ULTIMATE_STREAM.play(); console.log( 'stream restarted' ); }
    else { console.log( 'stream state:', typeof ULTIMATE_STREAM !== 'undefined' ? ULTIMATE_STREAM.paused : 'not defined' ); }
    btn.style.display = 'none';
  }

  document.addEventListener( 'click', unlock, { once: true } );

  this.mute     = this.ctx.createGain();
  this.gain     = this.ctx.createGain();
  this.analyzer = this.ctx.createAnalyser();

  this.analyzer.frequencyBinCount = 1024;
  this.analyzer.array = new Uint8Array( this.analyzer.frequencyBinCount );

  this.freqByteData = new Uint8Array( this.analyzer.frequencyBinCount );

  this.audioTexture  = new AudioTexture( this );
  
  this.texture = this.audioTexture.texture;

  this.gain.connect( this.analyzer );
  this.analyzer.connect( this.mute );
  this.mute.connect( this.ctx.destination );

  this.updateArray = [];

  this.notes = [];

}


AudioController.prototype.update = function(){

  this.analyzer.getByteFrequencyData( this.analyzer.array );
  this.analyzer.getByteFrequencyData( this.freqByteData );

  this.audioTexture.update();
  
  for( var i = 0; i < this.notes.length; i++ ){

    this.notes[i].update();

  }

  for( var i = 0; i < this.updateArray.length; i++ ){

    this.updateArray[i]();

  }



}

AudioController.prototype.addToUpdateArray = function( callback ){

  this.updateArray.push( callback );

}

AudioController.prototype.removeFromUpdateArray = function( callback ){

  for( var i = 0; i< this.updateArray.length; i++ ){

    if( this.updateArray[i] === callback ){

      this.updateArray.splice( i , 1 );
      console.log( 'SPLICED' );

    }

  }

}




