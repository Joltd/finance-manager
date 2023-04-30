package com.evgenltd.financemanager.conversion

import org.jgrapht.Graph
import org.jgrapht.alg.shortestpath.DijkstraShortestPath
import org.jgrapht.graph.DefaultWeightedEdge
import org.jgrapht.graph.builder.GraphTypeBuilder
import java.math.BigDecimal

fun main() {
    val graph = GraphTypeBuilder.undirected<String, String>()
        .buildGraph()

    graph.addVertex("RUB")
    graph.addVertex("USDT")
    graph.addVertex("USD")
    graph.addVertex("GEL")
    graph.addVertex("EUR")
    graph.addVertex("KZT")
    graph.addEdge("RUB", "USDT", "RUB/USDT")
    graph.addEdge("USDT", "USD", "USDT/USD")
    graph.addEdge("USD", "GEL", "USD/GEL")
    graph.addEdge("GEL", "EUR", "GEL/EUR")
    graph.addEdge("RUB", "KZT", "RUB/KZT")

    val alg = DijkstraShortestPath(graph)
    val result = alg.getPath("EUR", "RUB")
    println(result)
}

fun main1() {

    val graph = GraphTypeBuilder.directed<String,Price>()
        .allowingMultipleEdges(true)
        .edgeClass(Price::class.java)
        .weighted(true)
        .buildGraph()

    graph.addVertex("RUB")
    graph.addVertex("USD")
    graph.addVertex("EUR")
    graph.addVertex("GEL")
    graph.addVertex("KZT")
    graph.addVertex("USDT")
    graph.edge("Tinkoff Investment", "RUB", "USD", "64.74")
    graph.edge("Tinkoff Investment", "RUB", "EUR", "69.08")
    graph.edge("TBC Bank", "USD", "GEL", "0.3824")
    graph.edge("BCC", "RUB", "KZT", "0.140845")
    graph.edge("Binance P2P", "KZT", "USDT", "477.48")
    graph.edge("Binance P2P", "USDT", "GEL", "0.375939")
    graph.edge("Binance P2P", "USD", "USDT", "1.199")
    graph.edge("Binance P2P", "RUB", "USDT", "67.8")

    val alg = DijkstraShortestPath(graph)
    val result = alg.getPaths("RUB").getPath("GEL")

    println()

}

private fun Graph<String, Price>.edge(name: String, source: String, target: String, price: String) {
    addEdge(source, target)
        .also {
            setEdgeWeight(it, BigDecimal(price).toDouble())
            it.name = name
        }
}

class Price : DefaultWeightedEdge() {
    var name: String = ""
}