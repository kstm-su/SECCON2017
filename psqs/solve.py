import struct

f = open('cipher', "rb").read()
print(pow(f, 65537, 29756285957217824990174038832451778402099067307810847648290595785058431646976908322304147959112427140159792888914923236200167490011201811250432742134955076467161512399957077313964630071141735504154569672191460389697633956438555548934921730829103416692214221897316036431719854727062122070711252924237859981650839082127947619246716311728507350521260831762017879211408671194883521699107885995227760052190268561172377288494647487407578357795768368061699760835305355222313206649747987980403480055830409354654506995090037005532480704961830183236922268938782515705140754745094708066416483123932606937140087049605071066540057))