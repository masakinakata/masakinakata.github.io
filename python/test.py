class University:
    def __init__(self, name = "None", deviation = 50):
        self.name = name
        self.deviation = deviation

    def __lt__(self, other):
        return self.deviation < other.deviation

university = []
university.append(University("waseda", 68))
university.append(University("rikkyo", 60))
university.append(University("Tokyo", 73))
university.append(University("Tokyorika", 63))

university_min = min(university)
print(university_min.name, university_min.deviation)
