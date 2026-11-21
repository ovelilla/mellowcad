---
title: "AutoCAD COPYCLIP（复制剪裁）命令"
metaTitle: "CAD复制剪裁（COPYCLIP）：Ctrl+C 复制与粘贴"
description: "CAD Ctrl+C 复制怎么用？COPYCLIP（Ctrl+C）与 CUTCLIP、COPYBASE、PASTECLIP 配合：将对象复制到剪贴板，再在指定点粘贴，也可以粘贴到另一个图形。在浏览器中免费试用。"
figure: "COPYCLIP 复制板上的孔，然后在 65,20 处 PASTECLIP：副本以左下角放在该点，成为第二个孔。"
sourceHash: "f84c995e7c2b"
---

COPYCLIP（复制剪裁）命令将所选对象连同它们使用的图层、样式和块复制到剪贴板；图形不会改变，命令之前选择的对象保持选中。按 Ctrl+C 会运行它，并取消正在运行的命令。然后 <Command id="PASTECLIP" />（Ctrl+V）要求指定插入点：对象随光标移动，以其范围的左下角落在该点，位于当前 UCS 中，整个粘贴是一步，<Command id="U" /> 可以一步放弃。可以粘贴到同一个图形，也可以粘贴到另一个图形：剪贴板是系统的，因此另一个标签页中的图形也能读取，前提是浏览器允许页面读取剪贴板。粘贴的图层、样式或块与图形中已有的同名时，使用图形自己的。

<Command id="CUTCLIP" />（Ctrl+X）复制对象并将其删除，与 ERASE 相同。<Command id="COPYBASE" />（Ctrl+Shift+C）先要求指定基点，PASTECLIP 随后按该点而不是角点放置对象，使对象准确落在需要的位置。Ctrl+A 选择图形中的所有对象。

## Missing

PASTEBLOCK 和 CUTBASE，因此 Ctrl+Shift+V 和 Ctrl+Shift+X 留给浏览器，Ctrl+Shift+A 也是如此。PASTEORIG、PASTESPEC、在窗口之间拖动对象，以及将其他程序中的文字粘贴为多行文字。PASTECLIP 在插入点处的隐藏 INSERT 选项，因此粘贴时不能缩放、旋转或分解。

## Questions

### CAD中COPY和COPYCLIP有什么区别？

<Command id="COPY" /> 在同一个图形中放置副本，从基点到第二个点。COPYCLIP 将对象放到剪贴板，用 PASTECLIP 粘贴到当前图形或另一个图形。

### CAD怎么带基点复制？

按 Ctrl+Shift+C，或输入 `COPYBASE`，指定基点并选择对象。然后按 Ctrl+V，按该点放置对象。

### CAD怎么把对象复制到另一个图形？

选择对象并按 Ctrl+C，打开另一个图形并按 Ctrl+V，然后指定插入点。对象的图层、样式和块会一起带过去。

### CAD粘贴不了是什么原因？

浏览器可能会询问页面是否可以读取剪贴板：请允许。如果拒绝，PASTECLIP 粘贴同一页面中最后复制的内容。没有复制任何内容时，不会粘贴任何对象。
