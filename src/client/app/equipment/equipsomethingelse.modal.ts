import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IItem, ServerEventName, ItemSlot } from '../../../shared/interfaces';
import { SocketClusterService } from '../socket-cluster.service';
import { GameService } from '../game.service';

@Component({
  template: `
    <ion-header translucent>
      <ion-toolbar color="primary">
        <ion-title>Equip {{ slot }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ng-container *ngIf="(gameService.player$ | async) as player">
        <div class="blank-slate" *ngIf="(player.$inventoryData.items | filterBy:{ type: slot }).length === 0">
          You have no more {{ slot }} in your inventory.
        </div>

        <ion-row *ngFor="let item of (player.$inventoryData.items | filterBy:{ type: slot })">
          <ion-col>
            <app-item [item]="item"
                      [slot]="item.type"
                      (itemMenu)="equip($event, item)"></app-item>
          </ion-col>
        </ion-row>
      </ng-container>
    </ion-content>
  `,
})
export class EquipSomethingElseModal {

  @Input() public item: IItem;
  @Input() public slot: ItemSlot;

  public filteredItems: IItem[] = [];

  constructor(
    private modalCtrl: ModalController,
    private socketService: SocketClusterService,
    public gameService: GameService
  ) {}

  equip($event, item) {
    this.socketService.emit(ServerEventName.ItemEquip, { itemId: item.id });
    this.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
