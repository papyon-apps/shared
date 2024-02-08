import { exec } from "node:child_process";
import { readdir } from "node:fs/promises";

const DIR = ".";
const PREFIX = "build-";

type BuildFiles = {
  android: string;
  ios: string;
};

function execp(cmd: string) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(cmd, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });

    childProcess.stdout?.on("data", (data) =>
      console.log("↩︎", data.toString())
    );
    childProcess.stderr?.on("data", (data) =>
      console.error("stderr:", data.toString())
    );
  });
}

async function getLocalBuildFile(): Promise<BuildFiles | undefined> {
  try {
    const fileNames = await readdir(DIR);
    const buildFiles = fileNames.filter((fileName) =>
      fileName.startsWith(PREFIX)
    );

    const androidBuildFiles = buildFiles.filter((fileName) =>
      fileName.endsWith(".aab")
    );

    if (androidBuildFiles.length === 0) {
      console.log("No Android build files found.");
    }

    const iosBuildFiles = buildFiles.filter((fileName) =>
      fileName.endsWith(".ipa")
    );

    if (iosBuildFiles.length === 0) {
      console.log("No iOS build files found.");
    }

    return {
      android: androidBuildFiles[0],
      ios: iosBuildFiles[0],
    };
  } catch (error) {
    console.error("Error reading directory:", error);
  }
}

async function submit() {
  const buildFiles = await getLocalBuildFile();
  if (!buildFiles) {
    console.log("No build files found.");
    return;
  }

  if (buildFiles.ios) {
    const submitCommand = `eas submit -p ios --path ${buildFiles.ios}`;
    await execp(submitCommand);
  }
  if (buildFiles.android) {
    const submitCommand = `eas submit -p android --path ${buildFiles.android}`;
    await execp(submitCommand);
  }

  return buildFiles;
}

async function cleanup(buildFiles: BuildFiles) {
  if (buildFiles.ios) {
    await execp(`rm ${buildFiles.ios}`);
  }
  if (buildFiles.android) {
    await execp(`rm ${buildFiles.android}`);
  }
}

async function checkMasterBranch() {
  const stdout = (await execp("git branch --show-current")) as string;
  if (!["master", "main"].includes(stdout.trim())) {
    console.error(
      "Not on master branch. Switch to master or main branch. Aborting."
    );
    process.exit(1);
  }
}

async function commitAndPush() {
  await execp("git add .");
  await execp('git commit -m "Upgrade app version [skip ci]"');
  await execp("git push");
}

async function main() {
  await checkMasterBranch();
  const buildFiles = await submit();
  if (!buildFiles) {
    return;
  }
  await cleanup(buildFiles);
  await commitAndPush();
}

void main();
