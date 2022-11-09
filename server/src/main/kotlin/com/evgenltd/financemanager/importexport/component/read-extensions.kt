package com.evgenltd.financemanager.importexport.component

import org.jsoup.nodes.Node

operator fun Node.get(index: Int): Node = childNode(index)