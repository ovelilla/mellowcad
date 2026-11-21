---
title: "AutoCAD PURGE（清理）命令"
metaTitle: "CAD清理命令（PURGE）：删除未使用的块"
description: "CAD怎么清理没用的块：AutoCAD PURGE（清理，快捷键 PU）删除未被使用的块和线型，按名称或一次全部，可逐个确认，包括嵌套的块。在浏览器中免费试用。"
figure: "两个块：TAG 放在墙上，BOX 的唯一一个参照已被删除；PURGE 选择全部名称、不逐个确认，只删除了 BOX。"
sourceHash: "7a22ff19d409"
---

PURGE（清理）命令删除图形中已定义但未使用的内容；在这里指块和线型。AutoCAD 的 PURGE 会打开“清理”对话框；MellowCAD 没有这个对话框，因此 PURGE 像 AutoCAD 的控制台版本那样，在命令行中询问 <Command id="-PURGE" /> 询问的内容。它先显示嵌套项目和孤立数据两项设置（均为关闭），然后询问要清理哪种未使用的对象，提供 <Keyword id="Blocks" /> 和 <Keyword id="LTypes" />；在该处按 Enter 键结束命令。

只要图形中有参照放置了某个块，或者某个正在使用的块的定义中包含它（无论嵌套多深），这个块就处于使用状态。删除块的最后一个参照后，其定义仍留在图形中，<Command id="INSERT" /> 可以再次插入它：删除定义的是 PURGE。被保留的块所包含的块永远不会被删除，而只相互包含的一串块会在一次执行中全部删除。没有可删除的块时，提示 <Message id="noUnreferencedBlocks" />。每次执行都是一步，可以用 <Command id="U" /> 放弃。

## Options

### Blocks

询问要清理的名称，默认为 `*`，即所有未使用的块，也可以输入带通配符、用逗号分隔的名称。然后询问是否逐个确认：<Keyword id="Yes" />（默认值）在删除每个块之前询问，<Keyword id="No" /> 全部删除，并显示每个名称和删除的数量。

### LTypes

像 <Keyword id="Blocks" /> 一样询问名称以及是否逐个确认，然后删除未被使用的线型。Continuous、当前线型，以及被某个图层或对象（包括块内的对象）使用的线型总是保留；没有可删除的线型时，提示 <Message id="noUnreferencedLinetypes" />。<Command id="LINETYPE" /> 的加载可以把线型重新加载回来。

## Missing

“清理”对话框，以及所有其他类型：图层、文字样式和标注样式、编组、材质、多重引线样式、表格样式和视觉样式、注册的应用程序、零长度几何图形、空文字对象、孤立数据，以及“全部”。嵌套项目和孤立数据两项设置无法更改。

## Questions

### CAD清理快捷键是什么？

输入 `PU`，然后按 Enter 键或空格键。`-PU` 是命令行版本 <Command id="-PURGE" />，在这里 PURGE 执行的也是它。在任何语言版本的 AutoCAD 中都可以使用 `_PURGE`。

### CAD怎么清理没用的块？

输入 `PU`，选择 <Keyword id="Blocks" />，按 Enter 键选择所有名称，然后回答 <Keyword id="No" />，不逐个询问即可全部删除。

### CAD块为什么清理不掉？

因为它正在使用：图形中有参照放置了它，或者某个正在使用的块包含它，可能嵌套了好几层。删除它的参照，或分解包含它的块，PURGE 就能删除它。

### CAD怎么清理图层？

在 AutoCAD 中，使用 PURGE 的图层类型。这里还不能，这里的 PURGE 只清理块和线型；请改为在图层特性管理器中删除空图层。
