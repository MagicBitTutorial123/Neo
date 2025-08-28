async def mainLoop():
     import uasyncio as asyncio
     from machine import Pin
   
     for i in [21,22,26,27,4,2,12,13,14,15,5,32,33,16,17,18]:
   
         Pin(i, Pin.OUT).value(0)
   
     import neopixel
     from machine import Pin
     
     np = neopixel.NeoPixel(Pin(13), 1)
     
     
     np[0] = (100, 100, 100)
     np.write()
