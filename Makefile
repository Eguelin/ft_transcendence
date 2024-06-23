# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: eguelin <eguelin@student.42lyon.fr>        +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/28 17:47:48 by eguelin           #+#    #+#              #
#    Updated: 2024/06/23 16:54:31 by eguelin          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

.PHONY: all clean fclean re down restart
# .SILENT:

# **************************************************************************** #
#                                   Variable                                   #
# **************************************************************************** #

NAME	= ft_transcendence
DC		= docker compose

# **************************************************************************** #
#                                    Sources                                   #
# **************************************************************************** #

COMPOSE_FILE	= docker-compose.yml

SRCS_DIR		= src/
DB_DIR		= $(SRCS_DIR)db/

# **************************************************************************** #
#                                     Rules                                    #
# **************************************************************************** #

all: $(NAME)

$(NAME): $(DB_DIR)
	$(DC) -f $(COMPOSE_FILE) up --build

down:
	$(DC) -f $(COMPOSE_FILE) down

restart: down all

clean:
	$(DC) -f $(COMPOSE_FILE) down --volumes --rmi all

fclean: clean
	docker system prune --force --all;
	docker volume prune -f;
	sudo rm -rf $(DB_DIR)data

re: fclean all

$(DB_DIR):
	mkdir -p $@
