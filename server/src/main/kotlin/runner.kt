import Currency.Companion.HIDE
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue

fun main() {
    for (currency in Currency.values()) {
        val params = mutableListOf<String>()
        if (currency.isCrypto) {
            params.add(""" "crypto": true """)
        }
        if (currency.isOffChain) {
            params.add(""" "offChain": true """)
        }
        if (currency.base != null) {
            params.add(""" "baseCoin": "${currency.base}" """)
        }
        params.add(""" "order": ${currency.getOrder() + 1}000 """)
        if (currencyPatterns.containsKey(currency)) {
            params.add(""" "pattern": "${currencyPatterns[currency]}" """)
        }
        if (HIDE.contains(currency)) {
            params.add(""" "hideOnWalletScreen": true """)
        }
        val additionalParams = params.map { it.trim() }.joinToString(", ")
        val blockchainScale = scales[currency.name] ?: 18
        val row = "select '${currency.name}' coin, ${currency.scale} scaleClient, ${blockchainScale} scaleBlokchain, jsonb '{$additionalParams}' additional_parameters union all"
        println(row)
    }
}

@JvmField
val currencyPatterns = mapOf(
        Currency.BTC to """^(bitcoin:|btc:)?([123][a-km-zA-HJ-NP-Z1-9]{25,34}$)|(bc1[\w]{25,}$)""".toRegex(),
        Currency.ETH to """^(ethereum:)?0x[a-fA-F0-9]{40}$""".toRegex(),
        Currency.CRPT to """^(crypterium:|crpt_etht:)?0x[a-fA-F0-9]{40}$""".toRegex(),
        Currency.CRPT1 to """^(crypterium:|crpt_etht:)?0x[a-fA-F0-9]{40}$""".toRegex(),
        Currency.CRPT_OLD to """^(crypterium:|crpt_etht:)?0x[a-fA-F0-9]{40}$""".toRegex(),
        Currency.LTC to """^(litecoin:)?([LM3Q2][a-km-zA-HJ-NP-Z1-9]{26,33})|(ltc1[\w]{25,})$""".toRegex(),
        // https://github.com/k4m4/ripple-regex
        // https://test.bitgo.com/api/v2/#tag/Coin-specific-implementation
        // The BIP32 standard therefore cannot be taken advantage of, and hence generated XRP addresses
        // differ only in their sequentially incrementing destination tag components.
        Currency.XRP to """^r[0-9a-zA-Z]{24,34}(\?dt=\d+)?$""".toRegex(),
        // https://www.bitcoinabc.org/2018-01-14-CashAddr/
        Currency.BCH to """^(bitcoincash:|bch[^:]+:)?\w{25,}$""".toRegex(),
        // Dmitry F
        Currency.BNB to """^bnb[0-9a-zA-Z]{39}$""".toRegex(),
        Currency.DASH to """[1-9A-HJ-NP-Za-km-z]{34}""".toRegex(),
        Currency.TON to """^(0:)?[A-Za-z0-9_\-\+]{48,64}$""".toRegex(),
        Currency.EVER to """^(0:)?[A-Za-z0-9_\-\+]{48,64}$""".toRegex(),
        Currency.ANW to """^(ethereum:)?0x[a-fA-F0-9]{40}$""".toRegex(),
        Currency.BTCV to """^[A-Za-z0-9_\-\+]{34}$""".toRegex(),
        Currency.XDC to """^xdc[a-fA-F0-9]{40}$""".toRegex(),
        Currency.GLEEC to """^[A-Za-z0-9_\-\+]{34}$""".toRegex()
)
enum class Currency(
        val isCrypto: Boolean = false,
        val isFiat: Boolean = !isCrypto,
        val base: Currency? = null,
        val isOffChain: Boolean = false,
        val scale: Int = 8
) {
    USD,
    EUR(scale = 2),
    GBP,
    RUB,
    JPY,
    AUD,
    KRW,
    INR,
    BTC(isCrypto = true),
    BCH(isCrypto = true, base = BTC),
    ETH(isCrypto = true),
    XRP(isCrypto = true),
    LTC(isCrypto = true),
    CRPT(isCrypto = true, base = ETH),
    CRPT_OLD(isCrypto = true, base = ETH),
    CRPT1(isCrypto = true, base = ETH),
    CHO(isCrypto = true, base = ETH),
    CAD,
    USDC(isCrypto = true, base = ETH),
    USDT(isCrypto = true, base = ETH),
    CIX100(isCrypto = true, base = ETH),
    LINK(isCrypto = true, base = ETH),
    MKR(isCrypto = true, base = ETH),
    QASH(isCrypto = true, base = ETH),
    BAT(isCrypto = true, base = ETH),
    ZRX(isCrypto = true, base = ETH),
    REP(isCrypto = true, base = ETH),
    OMG(isCrypto = true, base = ETH),
    MAPS(isCrypto = true, base = ETH),
    SOL(isCrypto = true),
    DOGE(isCrypto = true),
    SHIB(isCrypto = true, base = ETH),
    TRX(isCrypto = true),
    MANA(isCrypto = true, base = ETH),
    SAND(isCrypto = true, base = ETH),
    GALA(isCrypto = true, base = ETH),
    AVAX(isCrypto = true),
    ALGO(isCrypto = true),
    UNI(isCrypto = true, base = ETH),
    MATIC(isCrypto = true, base = ETH),
    XEN1(isCrypto = true),
    XEN2(isCrypto = true),
    XEN3(isCrypto = true),
    AAC(isCrypto = true),
    TUSD,
    BNB(isCrypto = true),
    DAI(isCrypto = true, base = ETH),
    EURS(isCrypto = true, base = ETH),
    ANW(isCrypto = true),
    UCD(isCrypto = true),
    DASH(isCrypto = true),
    GRAM(isCrypto = true, isOffChain = true),
    TON(isCrypto = true),
    EVER(isCrypto = true),
    BTCV(isCrypto = true),
    GLEEC(isCrypto = true),
    DAO(isCrypto = true, base = ETH),
    UST(isCrypto = true, base = ETH),
    USTC(isCrypto = true, base = ETH),// UST and USTC are the same coin, remove one of them
    XDC(isCrypto = true),
    BPST(isCrypto = true),
    BKT(isCrypto = true);

    val isERC20Token: Boolean
        get() = ERC20_TOKENS.contains(this) || this == CIX100

    val isTON: Boolean
        get() = TON_TOKENS.contains(this)


    fun getOrder(): Int {
        val order = ORDER.indexOf(this)
        return if (order != -1) order else ORDER.size + ordinal
    }

    @JsonValue
    fun toValue(): String = when(this) {
        CRPT1 -> CRPT.name
        CRPT, CRPT_OLD -> CRPT_OLD_PUBLIC_NAME
        else  -> name
    }

    companion object {

        const val CRPT_OLD_PUBLIC_NAME = "CRPT-OLD"
        const val DEFAULT_AMOUNT_SCALE = 18

        @Suppress("MaxLineLength")
        val ERC20_TOKENS = listOf(CRPT, CRPT1, CRPT_OLD, USDC, USDT, MKR, QASH, LINK, BAT, ZRX, REP, OMG, DAI, EURS, MAPS, SHIB, GALA, MANA, SAND, UNI, MATIC, DAO, CHO, UST)

        val TON_TOKENS = listOf(TON, EVER)

        @JvmStatic
        fun ethTokens(): List<Currency> = ERC20_TOKENS

        @JvmField
        val ORDER = listOf(
                BPST, GLEEC, CHO, BTC, ETH, USDT, USDC, CRPT1, CRPT, BNB, SOL, XRP, DOGE, AVAX, SHIB, MATIC, LINK,
                LTC, UNI, ALGO, BCH, TRX, MANA, SAND, GALA, MKR, BAT, DASH,
                OMG, ZRX, REP, QASH, CIX100, DAI, EURS, ANW, BTCV, EVER, MAPS, XDC, XEN1, XEN2, XEN3
        )

        @JvmField
        val HIDE = listOf(XEN1, XEN2, XEN3)

        @Suppress("ReturnCount")
        @JvmStatic
        @JsonCreator
        fun fromString(key: String?): Currency? {
            if (CRPT_OLD_PUBLIC_NAME.equals(key, ignoreCase = true)) {
                return CRPT
            }
            if (CRPT.name.equals(key, ignoreCase = true)) {
                return CRPT1
            }
            for (type in values()) {
                if (type.name.equals(key, ignoreCase = true)) {
                    return type
                }
            }
            return null
        }
    }
}

val scales = mapOf(
        "BTC" to 8,
        "BCH" to 8,
        "BTG" to 8,
        "DASH" to 8,
        "ETH" to 18,
        "LTC" to 8,
        "RMG" to 8,
        "XLM" to 8,
        "XRP" to 6,
        "ZEC" to 8,
        "AE" to 18,
        "AERGO" to 18,
        "AION" to 18,
        "AOA" to 18,
        "ANA" to 18,
        "ANT" to 18,
        "APPC" to 18,
        "AST" to 18,
        "BAT" to 18,
        "BBX" to 18,
        "BCAP" to 18,
        "BCIO" to 18,
        "BID" to 18,
        "BNT" to 18,
        "BOX" to 18,
        "BNTY" to 18,
        "BTT" to 18,
        "BRD" to 18,
        "CAG" to 18,
        "CBC" to 18,
        "CDT" to 18,
        "CEL" to 18,
        "CHSB" to 18,
        "CLN" to 18,
        "CPAY" to 18,
        "CVC" to 18,
        "DAI" to 18,
        "DATA" to 18,
        "DENT" to 18,
        "DGX" to 18,
        "DRV" to 18,
        "ECHT" to 18,
        "EDR" to 18,
        "EGL" to 18,
        "ELF" to 18,
        "ENJ" to 18,
        "FMF" to 18,
        "FUN" to 18,
        "FXRT" to 18,
        "GEN" to 18,
        "GNO" to 18,
        "GNT" to 18,
        "GTO" to 18,
        "GUSD" to 18,
        "HOLD" to 18,
        "HOT" to 18,
        "HST" to 18,
        "HYB" to 18,
        "INCX" to 18,
        "IND" to 18,
        "KIN" to 18,
        "KNC" to 18,
        "LINK" to 18,
        "LION" to 18,
        "LNC" to 18,
        "LOOM" to 18,
        "LRC" to 18,
        "MDX" to 18,
        "MEDX" to 18,
        "MET" to 18,
        "META" to 18,
        "MFG" to 18,
        "MFT" to 18,
        "MITH" to 18,
        "MKR" to 18,
        "MTCN" to 18,
        "MTL" to 18,
        "MVL" to 8,
        "NAS" to 18,
        "NEXO" to 18,
        "NEU" to 18,
        "NMR" to 18,
        "NPXS" to 18,
        "OMG" to 18,
        "OPT" to 18,
        "PAX" to 18,
        "PAY" to 18,
        "PLC" to 18,
        "PMA" to 18,
        "POLY" to 18,
        "POWR" to 18,
        "PPT" to 18,
        "PRO" to 18,
        "QASH" to 6,
        "QRL" to 18,
        "QVT" to 18,
        "RBY" to 18,
        "RDN" to 18,
        "REB" to 18,
        "REBL" to 18,
        "REP" to 18,
        "REPV2" to 18,
        "SALT" to 18,
        "SHK" to 18,
        "SNOV" to 18,
        "SNT" to 18,
        "SRNT" to 18,
        "STORJ" to 18,
        "STORM" to 18,
        "TEN" to 18,
        "TKX" to 18,
        "TNT" to 18,
        "TRST" to 18,
        "TUSD" to 18,
        "UKG" to 18,
        "UPP" to 18,
        "UQC" to 8,
        "WAX" to 18,
        "WTC" to 18,
        "XRL" to 18,
        "ZCO" to 18,
        "ZIL" to 18,
        "ZRX" to 18,
        "CRPT" to 18,
        "CRPT1" to 18,
        "TBTC" to 8,
        "TBCH" to 8,
        "TDASH" to 8,
        "TETH" to 18,
        "TERC" to 0,
        "TLTC" to 8,
        "TRMG" to 8,
        "TXLM" to 8,
        "TXRP" to 6,
        "TZEC" to 8,
        "USDC" to 6,
        "USDT" to 6,
        "CIX100" to 18,
        "MAPS" to 6,
        "SHIB" to 18,
        "GALA" to 8,
        "SAND" to 18,
        "UNI" to 18,
        "MATIC" to 18,
        "DAO" to 18,
        "TON" to 9,
        "EVER" to 9,
        "TON_CRYSTAL" to 9,
        "EURS" to 2,
        "GLEEC" to 9,
        "BTCV" to 9,
        "ANW" to 18
)