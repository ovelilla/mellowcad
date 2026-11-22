---
title: "AutoCAD ERASE（刪除）指令"
metaTitle: "CAD 刪除指令（ERASE）：快捷鍵 E 與 Delete 鍵"
description: "AutoCAD 的 ERASE（E）如何使用：選取物件、按 Enter 即刪除；Delete 鍵、ALL，以及如何復原刪除的物件。可在瀏覽器中免費試用。"
figure: "一個矩形與其兩條對角線：點選一條對角線，按 Enter，即將其刪除。"
sourceHash: "2de33971060a"
---

ERASE（刪除）指令從圖面中移除所選取的物件。在 `Select objects:` 提示下選取物件，可以點選，也可以使用 AutoCAD 的任何選取模式（包括窗選與框選），然後按 Enter 或空白鍵：物件即被刪除，指令不會再顯示其他訊息。按 Esc 會結束指令而不刪除任何物件。與 AutoCAD 相同，在指令之前選取的物件會立即刪除，選取物件時按 Delete 鍵也會對其執行 ERASE。選取時，游標下的物件與已選取的物件會以淡化方式顯示，如同 AutoCAD 預覽將要刪除的物件。整個刪除為一個步驟，退回一次即可復原。

## Missing

OOPS，在 AutoCAD 中可以復原 ERASE 最後刪除的選集，即使之後已執行其他指令也可以。這裡可用 <Command id="U" /> 或 Ctrl+Z 退回刪除，但其後所做的一切也會一併退回。

## Questions

### AutoCAD 刪除的快捷鍵是什麼？

`E`，然後按 Enter 或空白鍵；`DELETE` 也是指令別名。或在 `Command:` 提示下選取物件，再按 Delete 鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可以輸入 `_ERASE`。

### 如何刪除圖面中的所有物件？

執行 ERASE，在 `Select objects:` 提示下輸入 `ALL`，然後按 Enter。位於鎖住圖層上的物件不會包含在內，選取時會顯示其數量。

### 如何復原刪除的物件？

立即輸入 <Command id="U" /> 或按 Ctrl+Z：刪除為一個退回步驟。OOPS 可以在執行其他指令後仍復原最後刪除的選集，目前尚未建置。

### ERASE 與 TRIM 有何不同？

ERASE 移除整個物件。<Command id="TRIM" /> 只移除物件超出其相交邊界的部分，其餘部分保留。
