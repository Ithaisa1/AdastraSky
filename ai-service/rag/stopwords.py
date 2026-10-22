"""Palabras vacías (sin tildes) para es/en/de. Se eliminan antes de vectorizar."""

STOPWORDS = frozenset("""
a al algo algun alguna algunas alguno algunos ante antes como con contra cual cuales cuando de del desde donde
dos el ella ellas ellos en entre era eran es esa esas ese eso esos esta estan estas este esto estos fue fueron
ha han hay la las le les lo los mas me mi mis mucho muy no nos o os otra otro para pero poco por porque que
quien se ser si sin sobre son su sus tambien te tiene tienen tu tus un una unas uno unos y ya yo puedo puede
se cuanto cuanta cuantos cuantas cual cuales dime hablame sabes saber quiero
the a an and are as at be been but by can could do does for from had has have how i if in into is it its
me my of on or our so than that the their them then there these they this to was we were what when where which
who why will with would you your about tell know want
der die das den dem des ein eine einer eines einem einen und oder aber ist sind war waren wird werden wie wo wann
was welche welcher welches wer warum mit von zu zum zur im in an am auf aus bei fur uber unter nach vor es ich
du sie er wir ihr man kann konnen gibt gibt's sich nicht noch auch nur so sehr mehr als
""".split())
