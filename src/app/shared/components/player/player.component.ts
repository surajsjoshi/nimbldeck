import { Component, OnInit, Input } from '@angular/core';
declare var $, mejs;

@Component({
  moduleId: module.id,
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  @Input() url = '';
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('audio,video').mediaelementplayer({
        videoWidth: '100%',
        videoHeight: '100%',
        stretching: 'fill',
        success: function (player, node) {
        }
      });
      this.onInitPlayer();
    });
  }

  onInitPlayer() {
    var media = $('.mejs__container').attr('id');
    var player = mejs.players[media];
    if (player) {
      player.setSrc(this.url);
      player.setPoster('');
      player.load();
      player.play();
    }
  }
}
