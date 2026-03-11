import csv, random

domains_pool = [
    "corp.nl", "financeops.eu", "infra.net", "hub.eu", "research.ai",
    "sandbox.ai", "cluster.eu", "techlab.com", "project.nl", "design.org",
    "design-lab.io", "ops.de", "security.net", "gateway.eu", "intra.local", "edge.app"
]

names = ["alex", "emma", "olaf", "maria", "john", "paul", "zoe", "felix", "noah", "megan", "clara", "nick", "leon", "stefan", "tom", "kate", "amy", "isaac", "sara", "max"]

def random_email(domain=None):
    name = random.choice(names)
    domain = domain or random.choice(domains_pool)
    return f"{name}.{random.choice(['smith','liu','hendriks','keller','vlaar','arnold','koeman','park','ross','meyer'])}@{domain}"

with open("workspaces.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["workspace", "accountable", "privileged members", "domains"])
    for i in range(1, 201):
        workspace = f"workspace-{i:03d}"
        accountable = random_email()
        priv_count = random.randint(0, 5)
        priv_members = ";".join(random_email() for _ in range(priv_count))
        dom_count = random.randint(0, 5)
        doms = ";".join(random.sample(domains_pool, dom_count))
        writer.writerow([workspace, accountable, priv_members, doms])
