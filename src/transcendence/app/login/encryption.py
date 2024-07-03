


                                                   
#   ____    ____  ______     _______   
#  |_   \  /   _||_   _ `.  |  _____|  
#    |   \/   |    | | `. \ | |____    
#    | |\  /| |    | |  | | '_.____''. 
#   _| |_\/_| |_  _| |_.' / | \____) | 
#  |_____||_____||______.'   \______.' 
# doc : https://www.ietf.org/rfc/rfc1321.txt



# rotate x by y bits to the left
from typing import BinaryIO
from io import BytesIO

import numpy as np


def left_rotate (x, y):
	return ((x << (y & 31)) | ((x & 0xffffffff) >> (32 - (y & 31)))) & 0xffffffff;

def F(b, c, d):
	return (d ^ (b & (c ^ d)));

def G(b, c, d):
	return (c ^ (d & (b ^ c)));

def H(b, c, d):
	return (b ^ c ^ d);

def I(b, c, d):
	return (c ^ (b | (~d)));


block_size = 64
digest_size = 16

mixer_step = [F for _ in range(16)] + [G for _ in range(16)] + [H for _ in range(16)] + [I for _ in range(16)]

msg_step = [i for i in range(16)] + [(5 * i + 1) % 16 for i in range(16)] + [(3 * i + 5) % 16 for i in range(16)] + [(7 * i) % 16 for i in range(16)]

shift = [
7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
]

sines = np.abs(np.sin(np.arange(64) + 1))
sine_random = [int(x) for x in np.floor(2 ** 32 * sines)]

class md5State:
	def __init__(self):
		self.length: int = 0
		self.state: tuple[int, int, int, int] = (0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476)
		self.filled_bytes: int = 0
		self.buf: bytearray = bytearray(block_size)
	
	def digest(self) -> bytes:
		return b''.join(x.to_bytes(length=4, byteorder='little') for x in self.state)
	def hex_digest(self) -> str:
		return self.digest().hex()
	
	def process(self, stream: BinaryIO) -> None:
		if self.filled_bytes < len(self.buf):
			c_buffer = memoryview(self.buf)
			while bytes_read := stream.read(block_size - self.filled_bytes):
				c_buffer[self.filled_bytes:self.filled_bytes + len(bytes_read)] = bytes_read
				if self.filled_bytes == 0 and len(bytes_read) == block_size:
					self.compress(self.buf)
					self.length += block_size
				else:
					self.filled_bytes += len(bytes_read)
					if self.filled_bytes == block_size:
						self.compress(self.buf)
						self.length += block_size
						self.filled_bytes = 0
	
	def compress(self, chunk: bytearray) -> None:
		if len(chunk) == block_size:
			chunk_ints = [int.from_bytes(chunk[i:i + 4], byteorder="little") for i in range(0, block_size, 4)]
			if len(chunk_ints) == 16:
				a,b,c,d = self.state
				
				for i in range(block_size):
					bit_mixer = mixer_step[i]
					msg_idx = msg_step[i]
					a = (a + bit_mixer(b,c,d) + chunk_ints[msg_idx] + sine_random[i]) % (2 ** 32)
					a = left_rotate(a, shift[i])
					a = (a + b) % (2 ** 32)
					a,b,c,d = d,a,b,c
				
				self.state = (
					(self.state[0] + a) % (2 ** 32),
					(self.state[1] + b) % (2 ** 32),
					(self.state[2] + c) % (2 ** 32),
					(self.state[3] + d) % (2 ** 32)
				)
	
	def finalise(self) -> None:
		if (self.filled_bytes < block_size):
			self.length += self.filled_bytes
			self.buf[self.filled_bytes] = 0b10000000
			self.filled_bytes += 1
			
			bytes_needed = 8
			
			if self.filled_bytes + bytes_needed > block_size:
				self.buf[self.filled_bytes:] = bytes(block_size - self.filled_bytes)
				self.compress(self.buf)
				self.filled_bytes = 0
			
			self.buf[self.filled_bytes:] = bytes(block_size - self.filled_bytes)
			bit_len_64 = (self.length * 8) % (2 ** 64)
			self.buf[-bytes_needed:] = bit_len_64.to_bytes(length=bytes_needed, byteorder="little")
			
			self.compress(self.buf)

def md5(s: bytes) -> bytes:
	state = md5State()
	state.process(BytesIO(s))
	state.finalise()
	print(state.hex_digest())
	return (state.digest())
	
md5(b"hello")