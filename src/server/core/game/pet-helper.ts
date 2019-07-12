import { Singleton, AutoWired, Inject } from 'typescript-ioc';
import { species } from 'fantastical';

import { PetAttribute, Stat, IPet, IPlayer, IPetProto, PetAffinity, PetUpgrade, IItem, ItemSlot } from '../../../shared/interfaces';
import { RNGService } from './rng-service';
import { AssetManager } from './asset-manager';
import { Pet } from '../../../shared/models/Pet';

import * as Attributes from './attributes';
import * as Affinities from './affinities';
import { Item } from '../../../shared/models';

@Singleton
@AutoWired
export class PetHelper {

  @Inject private assets: AssetManager;
  @Inject private rng: RNGService;

  getPetProto(proto: string): IPetProto {
    if(!this.assets.allPetAssets[proto]) throw new Error(`No pet proto ${proto} exists`);
    return this.assets.allPetAssets[proto];
  }

  buyPet(forPlayer: IPlayer, petName: string): IPet {
    const proto = this.getPetProto(petName);
    const pet = this.createPet(forPlayer, proto);

    pet.init();

    this.syncPetBasedOnProto(pet);
    return pet;
  }

  createPet(forPlayer: IPlayer, petProto: IPetProto): IPet {
    const gender = this.rng.pickone(forPlayer.availableGenders);
    const attribute = petProto.attribute || this.rng.pickone(Object.values(PetAttribute));
    const affinity = petProto.affinity || this.rng.pickone(Object.values(PetAffinity));

    const pet = new Pet();

    const func = this.rng.pickone(Object.keys(species));

    pet.typeName = petProto.typeName;
    pet.name = species[func]();
    pet.gender = gender;
    pet.attribute = attribute;
    pet.affinity = affinity;

    return pet;
  }

  getPetUpgradeValue(pet: IPet, upgrade: PetUpgrade): number {
    const proto = this.getPetProto(pet.typeName);
    return proto.upgrades[upgrade][pet.upgradeLevels[upgrade]].v;
  }

  getPetCost(petType: string): number {
    const proto = this.getPetProto(petType);
    return proto.cost;
  }

  syncPetNextUpgradeCost(pet: IPet): void {
    const proto = this.getPetProto(pet.typeName);

    pet.$currentUpgrade = {};
    pet.$nextUpgrade = {};

    Object.values(PetUpgrade).forEach(upgrade => {
      pet.$currentUpgrade[upgrade] = proto.upgrades[upgrade][pet.upgradeLevels[upgrade]];
      pet.$nextUpgrade[upgrade] = proto.upgrades[upgrade][pet.upgradeLevels[upgrade] + 1];
    });
  }

  syncPetAttribute(pet: IPet): void {
    pet.$attribute = new Attributes[pet.attribute]();
  }

  syncPetAffinity(pet: IPet): void {
    pet.$affinity = new Affinities[pet.affinity]();
  }

  syncBasePetStats(pet: IPet): void {
    const proto = this.getPetProto(pet.typeName);

    const soulItem = new Item();
    soulItem.init({
      name: `${pet.typeName} Soul`,
      stats: { ...proto.soulStats }
    });

    pet.equipment[ItemSlot.Soul] = [soulItem];
  }

  syncPetEquipmentSlots(pet: IPet): void {
    const proto = this.getPetProto(pet.typeName);
    pet.equipment = pet.equipment || {};

    Object.keys(proto.equipmentSlots).forEach(slotName => {
      pet.equipment[slotName] = pet.equipment[slotName] || [];
      pet.equipment[slotName].length = proto.equipmentSlots[slotName];
    });
  }

  syncPetBasedOnProto(pet: IPet): void {
    const proto = this.getPetProto(pet.typeName);
    this.syncPetNextUpgradeCost(pet);

    pet.level.maximum = this.getPetUpgradeValue(pet, PetUpgrade.MaxLevel);
    pet.gold.maximum = this.getPetUpgradeValue(pet, PetUpgrade.GoldStorage);
    pet.permanentUpgrades = Object.assign({}, proto.permanentUpgrades);

    this.syncPetEquipmentSlots(pet);
    this.syncBasePetStats(pet);
    this.syncPetAttribute(pet);
    this.syncPetAffinity(pet);
  }

}
