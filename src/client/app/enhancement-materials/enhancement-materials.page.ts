import { Component, OnInit } from '@angular/core';
import { SocketClusterService } from '../socket-cluster.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-enhancement-materials',
  templateUrl: './enhancement-materials.page.html',
  styleUrls: ['./enhancement-materials.page.scss'],
})
export class EnhancementMaterialsPage implements OnInit {

  public crystals = [
    { name: 'Green',  color: '#0a0' },
    { name: 'Yellow', color: '#aa0' },
    { name: 'Red',    color: '#a00' },
    { name: 'Blue',   color: '#00a' },
    { name: 'Purple', color: '#a0a' },
    { name: 'Orange', color: '#fa5' },
    { name: 'Astral' }
  ];

  constructor(
    private socketService: SocketClusterService,
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

}
