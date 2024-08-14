# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: llevasse <llevasse@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/28 17:47:48 by eguelin           #+#    #+#              #
#    Updated: 2024/07/07 14:24:04 by llevasse         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

.PHONY: all clean fclean re down restart
# .SILENT:

# **************************************************************************** #
#                                   Variable                                   #
# **************************************************************************** #

NAME	= ft_transcendence
DC		= docker compose
PFP		= $(shell find src/transcendence/app/profilePictures/ -name "*.jpg" | grep -v "defaults/")

# **************************************************************************** #
#                                    Sources                                   #
# **************************************************************************** #

DB_DIR	= ~/goinfre/db/

# **************************************************************************** #
#                                     Rules                                    #
# **************************************************************************** #

all: $(NAME)

$(NAME): $(DB_DIR)
	$(DC) up --build

down:
	$(DC) down

restart: down all

clean:
	$(DC) down --volumes --rmi all

fclean: clean
	docker system prune --force --all;
	docker volume prune -f;
    ifneq ($(PFP),)
		rm -f $(PFP)
    endif

re: fclean all
	docker exec -it transcendence python3 manage.py migrate

$(DB_DIR):
	mkdir -p $@
