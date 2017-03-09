// 2017 Spring Network Programming Assignment 2  (yanx3 - Xinyue Yan) 
// "TFTP server" 

#include <stdio.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>
#include <stdlib.h>




int main() {
	int tftpServer;
	struct sockaddr_in serverAddr;
	socklen_t addr_size;

	//create server socket
	tftpServer = socket(AF_INET, SOCK_STREAM, 0);
	if (socketfd == -1) {
	    //check whether socket can be created 
	    perror("The socket cannot be created!");
	    return 1;
	}	

	//configure 
	bzero(&serverAddr, sizeof(serverAddr));
	serverAddr.sin_family = AF_INET;
	serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
	serverAddr.sin_port = htons(69);

	//bind the socket with the address struct
	if (bind(tftpServer, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        perror("bind failed.");
        return 1;		
	} 





	return 0;
}
