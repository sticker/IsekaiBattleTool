import { ICharacter } from './interfaces';

export function characterFromContract(tokenId: number, metadataJson: any): ICharacter {
  const name = metadataJson.name;
  const image = metadataJson.image;
  let GenerationType;
  let Weapon;
  let Armor;
  let Sex;
  let Species;
  let Heritage;
  let Personality;
  let UsedSeed;
  let Level;
  let ATK;
  let DEF;
  let LUK;
  const attr = metadataJson.attributes;
  for(let i = 0; i < attr.length; i++) {
    if(attr[i].trait_type === 'Generation Type') {
      GenerationType = attr[i].value;
    } else if(attr[i].trait_type === 'Weapon') {
      Weapon = attr[i].value;
    } else if(attr[i].trait_type === 'Armor') {
      Armor = attr[i].value;
    } else if(attr[i].trait_type === 'Sex') {
      Sex = attr[i].value;
    } else if(attr[i].trait_type === 'Species') {
      Species = attr[i].value;
    } else if(attr[i].trait_type === 'Heritage') {
      Heritage = attr[i].value;
    } else if(attr[i].trait_type === 'Personality') {
      Personality = attr[i].value;
    } else if(attr[i].trait_type === 'UsedSeed') {
      UsedSeed = attr[i].value;
    } else if(attr[i].trait_type === 'Level') {
      Level = attr[i].value;
    } else if(attr[i].trait_type === 'ATK') {
      ATK = attr[i].value;
    } else if(attr[i].trait_type === 'DEF') {
      DEF = attr[i].value;
    } else if(attr[i].trait_type === 'LUK') {
      LUK = attr[i].value;
    }
  }
  return { tokenId, name, image, GenerationType, Weapon, Armor, Sex, Species, Heritage,
    Personality, UsedSeed, Level, ATK, DEF, LUK };
}
