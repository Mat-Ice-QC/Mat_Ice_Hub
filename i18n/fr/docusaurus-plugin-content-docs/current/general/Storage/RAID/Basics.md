---
pagination_next: null
pagination_prev: null
---

# RAID MD : Les bases

RAID (Redundant Array of Independent Disks — Ensemble Redondant de Disques Indépendants) est une technologie qui permet de combiner plusieurs disques physiques en une seule unité logique pour la **redondance, la performance, ou les deux**. Sous Linux, l'outil `mdadm` est l'utilitaire standard pour gérer les arrays RAID logiciels.

---
## Qu'est-ce que le RAID ?

Le RAID combine plusieurs disques en une seule unité de stockage logique. Les objectifs principaux sont :

* **Redondance :** Protection contre les pannes de disques.
* **Performance :** Amélioration des vitesses de lecture/écriture.
* **Capacité :** Agrégation de plusieurs disques en un seul volume.

Le RAID peut être implémenté en **matériel** (via des contrôleurs RAID) ou en **logiciel** (avec Linux `mdadm`).

---

## Niveaux RAID

Niveaux RAID logiciels courants sous Linux :

| Niveau       | Description                                  | Disques minimum | Avantages                          | Inconvénients                             |
| ----------- | -------------------------------------------- | ------------- | ----------------------------- | -------------------------------- |
| **RAID 0**  | Striping (entrelacement)                     | 2             | Haute performance              | Aucune redondance                    |
| **RAID 1**  | Miroir                                       | 2             | Redondance                    | Surcoût élevé en disques               |
| **RAID 4**  | Striping par blocs avec parité               | 3             | Tolérance aux pannes               | Goulot d'étranglement de parité                |
| **RAID 5**  | Striping par blocs avec parité distribuée    | 3             | Tolérance aux pannes + performance | Reconstruction lente              |
| **RAID 6**  | Comme RAID 5 mais avec double parité         | 4             | Tolère 2 pannes de disques  | Écritures plus lentes                    |
| **RAID 10** | Entrelacement de miroirs                     | 4             | Haute performance + redondance | Coûteux (50 % de surcoût en stockage) |

---

## Installation de `mdadm`

Pour installer `mdadm` :

```bash
sudo apt update
sudo apt install mdadm -y   # Debian/Ubuntu
# OU
sudo yum install mdadm -y   # RHEL/CentOS
```

Vérifiez l'installation :

```bash
mdadm --version
```

---

## Création d'un array RAID

### Étape 1 : Identifier les disques

```bash
lsblk
```

Assurez-vous que les disques sont démontés et ne contiennent pas de données importantes.

### Étape 2 : Créer le RAID

Exemple : Créer un RAID 5 avec trois disques (`/dev/sdb`, `/dev/sdc`, `/dev/sdd`) :

```bash
sudo mdadm --create --verbose /dev/md0 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd
```

### Étape 3 : Vérifier la création du RAID

```bash
cat /proc/mdstat
```

### Étape 4 : Formater et monter le RAID

```bash
sudo mkfs.ext4 /dev/md0
sudo mkdir -p /mnt/raid
sudo mount /dev/md0 /mnt/raid
```

### Étape 5 : Persister la configuration RAID

```bash
sudo mdadm --detail --scan >> /etc/mdadm/mdadm.conf
```

---

## Gestion des arrays RAID

* **Vérifier les détails du RAID :**

```bash
sudo mdadm --detail /dev/md0
```

* **Arrêter un array RAID :**

```bash
sudo mdadm --stop /dev/md0
```

* **Supprimer un array RAID :**

```bash
sudo mdadm --remove /dev/md0
```

* **Ajouter un nouveau disque au RAID :**

```bash
sudo mdadm --add /dev/md0 /dev/sde
```

---

## Surveillance du RAID

* **Vérifier l'état :**

```bash
cat /proc/mdstat
```

* **Vérifier la santé du RAID :**

```bash
sudo mdadm --detail /dev/md0
```

* **Configurer les notifications par courriel :**

Modifiez `/etc/mdadm/mdadm.conf` pour inclure :

```text
MAILADDR admin@example.com
```

---

## Références

* [Manuel mdadm](https://man7.org/linux/man-pages/man8/mdadm.8.html)
* [Wiki RAID Linux](https://wiki.archlinux.org/title/RAID)
