import { BasePerk } from '../interfaces/editor.interface'
import { InventoryItem, InventoryItems } from '../interfaces/inventoryItem.interface'
import { PlugSets } from '../interfaces/plugSet.interface'
import { SocketCategory } from '../utils/enums'
import { getAllFromSocket } from '../utils/getAllFromSocket'
import { makeBasePerk } from '../utils/makeBasePerk'

export const weaponCraftingRecipes = (
   inventoryItems: InventoryItems,
   plugSets: PlugSets,
   inventoryItemCraftingRecipes: InventoryItem[]
) => {
   return inventoryItemCraftingRecipes.reduce<{ [key: string]: BasePerk }>((acc, weapon) => {
      const weaponSockets = weapon.sockets
      if (weaponSockets === undefined) return acc

      const craftingSocketCategory = weaponSockets.socketCategories.find(
         (socketCategory) => socketCategory.socketCategoryHash === SocketCategory.weaponCraftingPerks
      )

      craftingSocketCategory?.socketIndexes.forEach((socketIndex) => {
         const craftingArr = getAllFromSocket(inventoryItems, plugSets, weaponSockets.socketEntries[socketIndex])

         craftingArr.forEach((craftingHash) => {
            const craftingStuff = inventoryItems[craftingHash]
            const newWeaponHash = weapon?.crafting?.outputItemHash
            const newWeapon = inventoryItems[newWeaponHash || '']
            const isExotic = craftingStuff.inventory.tierTypeName === 'Exotic'

            if (
               craftingStuff?.itemTypeDisplayName === 'Intrinsic' ||
               craftingStuff?.itemTypeDisplayName === 'Enhanced Intrinsic'
            ) {
               const type = isExotic ? 'weaponFrameExotic' : 'weaponFrame'
               acc[craftingHash] = makeBasePerk(craftingStuff, type, newWeapon)
               return
            }

            if (craftingStuff?.itemTypeDisplayName === 'Trait') {
               const type = isExotic ? 'weaponPerkExotic' : 'weaponPerk'
               acc[craftingHash] = makeBasePerk(craftingStuff, type, newWeapon)
               return
            }
            if (craftingStuff?.itemTypeDisplayName === 'Enhanced Trait') {
               acc[craftingHash] = makeBasePerk(craftingStuff, 'weaponPerkEnhanced', newWeapon)
               return
            }

            if (craftingStuff?.itemTypeDisplayName === 'Origin Trait') {
               acc[craftingHash] = makeBasePerk(craftingStuff, 'weaponOriginTrait', newWeapon)
               return
            }

            if (craftingStuff?.displayProperties.name.endsWith(' Catalyst')) {
               acc[craftingHash] = makeBasePerk(craftingStuff, 'weaponCatalystExotic', newWeapon)
               return
            }
         })
      })
      return acc
   }, {})
}
